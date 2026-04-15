package org.example.hotelm.booking.service.impl;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hotelm.booking.dto.BookingCreateRequest;
import org.example.hotelm.booking.dto.BookingQueueResult;
import org.example.hotelm.booking.entity.Booking;
import org.example.hotelm.booking.mapper.BookingMapper;
import org.example.hotelm.booking.service.BookingQueueService;
import org.example.hotelm.booking.service.BookingRedisLockService;
import org.example.hotelm.booking.service.BookingService;
import org.example.hotelm.room.entity.Room;
import org.example.hotelm.user.entity.User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingQueueServiceImpl implements BookingQueueService {

    private final BookingService bookingService;
    private final BookingMapper bookingMapper;
    private final BookingRedisLockService redisLockService;

    // Queue chứa các yêu cầu đặt phòng chờ xử lý
    private final BlockingQueue<BookingTask> taskQueue = new LinkedBlockingQueue<>();

    // Lưu kết quả xử lý theo requestId
    private final Map<String, BookingQueueResult> resultStore = new ConcurrentHashMap<>();

    // Single-thread executor đảm bảo xử lý tuần tự
    private final ExecutorService executor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "booking-queue-worker");
        t.setDaemon(true);
        return t;
    });

    @PostConstruct
    public void startWorker() {
        executor.submit(() -> {
            log.info("Booking queue worker started");
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    BookingTask task = taskQueue.take();
                    processTask(task);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Booking queue worker interrupted");
                } catch (Exception e) {
                    log.error("Unexpected error in booking queue worker", e);
                }
            }
        });
    }

    @Override
    public String enqueue(BookingCreateRequest request) {
        String requestId = UUID.randomUUID().toString();
        resultStore.put(requestId, BookingQueueResult.pending());
        taskQueue.offer(new BookingTask(requestId, request));
        log.info("Booking request enqueued: requestId={}, roomId={}", requestId, request.roomId());
        return requestId;
    }

    @Override
    public BookingQueueResult getResult(String requestId) {
        return resultStore.getOrDefault(requestId, BookingQueueResult.notFound());
    }

    private void processTask(BookingTask task) {
        String roomId = task.request().roomId();
        String lockKey = "booking:lock:room:" + roomId;

        log.info("Processing booking task: requestId={}, roomId={}", task.requestId(), roomId);

        boolean locked = redisLockService.tryLock(lockKey, 10);
        if (!locked) {
            log.warn("Could not acquire lock for roomId={}, re-queuing...", roomId);
            taskQueue.offer(task);
            sleepQuietly(200);
            return;
        }

        try {
            BookingCreateRequest req = task.request();

            // Double-check overlap inside lock
            boolean overlapping = bookingService.hasOverlappingBooking(
                    roomId, req.checkIn(), req.checkOut());

            if (overlapping) {
                resultStore.put(task.requestId(),
                        BookingQueueResult.failed("Phòng đã được đặt trong khoảng thời gian này"));
                return;
            }

            User user = new User();
            user.setUserID(req.userId());
            Room room = new Room();
            room.setRoomID(roomId);

            Booking booking = bookingService.createBooking(
                    bookingMapper.toEntity(req, user, room));

            resultStore.put(task.requestId(),
                    BookingQueueResult.success(bookingMapper.toResponse(booking)));
            log.info("Booking created: requestId={}, bookingId={}",
                    task.requestId(), booking.getBookingID());

        } catch (Exception e) {
            log.error("Failed to process booking task: requestId={}", task.requestId(), e);
            resultStore.put(task.requestId(),
                    BookingQueueResult.failed("Lỗi hệ thống: " + e.getMessage()));
        } finally {
            redisLockService.unlock(lockKey);
        }
    }

    private void sleepQuietly(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    record BookingTask(String requestId, BookingCreateRequest request) {}
}