package org.example.hotelm.refund.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.booking.entity.Booking;
import org.example.hotelm.booking.repository.BookingRepository;
import org.example.hotelm.common.exception.BadRequestException;
import org.example.hotelm.common.exception.ConflictException;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.example.hotelm.refund.dto.RefundCreateRequest;
import org.example.hotelm.refund.dto.RefundResponse;
import org.example.hotelm.refund.entity.RefundRequest;
import org.example.hotelm.refund.mapper.RefundMapper;
import org.example.hotelm.refund.repository.RefundRepository;
import org.example.hotelm.refund.service.RefundService;
import org.example.hotelm.room.entity.Room;
import org.example.hotelm.room.repository.RoomRepository;
import org.example.hotelm.user.entity.User;
import org.example.hotelm.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RefundMapper refundMapper;
    private final org.example.hotelm.notification.service.NotificationService notificationService;

    @Override
    public List<RefundResponse> getAllRefunds() {
        return refundRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(refundMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public RefundResponse createRefund(RefundCreateRequest request) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.bookingId()));

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userId()));

        if (booking.getUser() == null || !booking.getUser().getUserID().equals(user.getUserID())) {
            throw new BadRequestException("Booking does not belong to the provided user.");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED || booking.getStatus() == Booking.BookingStatus.CHECKED_OUT) {
            throw new BadRequestException("This booking is not eligible for refund.");
        }

        boolean duplicated = refundRepository.existsByBooking_BookingIDAndStatusIn(
                booking.getBookingID(),
                Set.of(RefundRequest.RefundStatus.PENDING, RefundRequest.RefundStatus.APPROVED)
        );
        if (duplicated) {
            throw new ConflictException("A refund request already exists for this booking.");
        }

        RefundRequest refund = new RefundRequest();
        refund.setBooking(booking);
        refund.setUser(user);
        refund.setReason(request.reason().trim());
        refund.setStatus(RefundRequest.RefundStatus.PENDING);
        refund.setCreatedAt(LocalDateTime.now());
        refund.setReviewedAt(null);

        RefundRequest saved = refundRepository.save(refund);

        // Notify Admins about new refund request
        notificationService.notifyAdmins(
                "New Refund Request",
                "A new refund has been requested for booking " + booking.getBookingID(),
                org.example.hotelm.notification.entity.Notification.NotificationType.REFUND_REQUEST,
                saved.getRefundId()
        );

        return refundMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RefundResponse updateStatus(String refundId, RefundRequest.RefundStatus status) {
        RefundRequest refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund request not found: " + refundId));

        if (refund.getStatus() != RefundRequest.RefundStatus.PENDING) {
            throw new ConflictException("Refund request has already been processed.");
        }

        refund.setStatus(status);
        refund.setReviewedAt(LocalDateTime.now());

        if (status == RefundRequest.RefundStatus.APPROVED) {
            Booking booking = refund.getBooking();
            if (booking != null) {
                booking.setStatus(Booking.BookingStatus.CANCELLED);
                if (booking.getRoom() != null && booking.getRoom().getStatus() == Room.RoomStatus.BOOKED) {
                    booking.getRoom().setStatus(Room.RoomStatus.AVAILABLE);
                    roomRepository.save(booking.getRoom());
                }
                bookingRepository.save(booking);
            }
        }

        RefundRequest saved = refundRepository.save(refund);

        // Notify User about refund status
        if (saved.getUser() != null) {
            String title = status == RefundRequest.RefundStatus.APPROVED ? "Refund Approved" : "Refund Rejected";
            String msg = status == RefundRequest.RefundStatus.APPROVED 
                    ? "Your refund request for booking " + (saved.getBooking() != null ? saved.getBooking().getBookingID() : "") + " has been approved."
                    : "Your refund request for booking " + (saved.getBooking() != null ? saved.getBooking().getBookingID() : "") + " was rejected.";
            
            notificationService.createAndPush(
                    saved.getUser().getUserID(),
                    title,
                    msg,
                    org.example.hotelm.notification.entity.Notification.NotificationType.REFUND_STATUS,
                    saved.getRefundId()
            );
        }

        return refundMapper.toResponse(saved);
    }


    @Override
    @Transactional
    public void deleteRefund(String refundId) {
        if (!refundRepository.existsById(refundId)) {
            throw new ResourceNotFoundException("Refund request not found: " + refundId);
        }
        refundRepository.deleteById(refundId);
    }
}

