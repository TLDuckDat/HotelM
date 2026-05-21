package org.example.hotelm.room.service.impl;

import lombok.RequiredArgsConstructor;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.example.hotelm.branch.entity.Branch;
import org.example.hotelm.branch.repository.BranchRepository;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.example.hotelm.room.dto.RoomCreateRequest;
import org.example.hotelm.room.dto.RoomResponse;
import org.example.hotelm.room.dto.RoomUpdateRequest;
import org.example.hotelm.room.entity.Room;
import org.example.hotelm.room.entity.RoomType;
import org.example.hotelm.room.mapper.RoomMapper;
import org.example.hotelm.room.repository.RoomRepository;
import org.example.hotelm.room.repository.RoomTypeRepository;
import org.example.hotelm.room.service.RoomService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomMapper roomMapper;
    private final BranchRepository branchRepository;
    private final Cloudinary cloudinary;
    private final org.example.hotelm.booking.repository.BookingRepository bookingRepository;
    private final org.example.hotelm.notification.service.NotificationService notificationService;

    @Override
    @Cacheable(cacheNames = "rooms", key = "'all'")

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll()
                .stream()
                .map(roomMapper::toRoomResponse)
                .toList();
    }

    @Override
    @Cacheable(cacheNames = "rooms", key = "#id")
    public RoomResponse getRoomById(String id) {
        Room room = findRoomOrThrow(id);
        return roomMapper.toRoomResponse(room);
    }

    @Override
    @CacheEvict(cacheNames = "rooms", allEntries = true)
    public RoomResponse createRoom(RoomCreateRequest request) {
        RoomType roomType = findRoomTypeOrThrow(request.getRoomTypeId());
        Room room = roomMapper.toRoomEntity(request);
        room.setRoomType(roomType);

        if (request.getBranchId() != null && !request.getBranchId().isBlank()) {
            Branch branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy chi nhánh: " + request.getBranchId()));
            room.setBranch(branch);
        }

        return roomMapper.toRoomResponse(roomRepository.save(room));
    }

    @Override
    @CacheEvict(cacheNames = "rooms", allEntries = true)
    public RoomResponse updateRoom(String id, RoomUpdateRequest request) {
        Room existing = findRoomOrThrow(id);
        String oldImageUrl = existing.getImageUrl();
        
        roomMapper.applyUpdate(request, existing);

        if (request.getImageUrl() != null && !request.getImageUrl().equals(oldImageUrl)) {
            deleteImageFromCloudinary(oldImageUrl);
        }

        // Cập nhật roomType nếu có thay đổi
        if (request.getRoomTypeId() != null) {
            RoomType roomType = findRoomTypeOrThrow(request.getRoomTypeId());
            existing.setRoomType(roomType);
        }

        return roomMapper.toRoomResponse(roomRepository.save(existing));
    }

    @Override
    @CacheEvict(cacheNames = "rooms", allEntries = true)
    public void deleteRoom(String id) {
        Room room = findRoomOrThrow(id);
        roomRepository.deleteById(id);
        deleteImageFromCloudinary(room.getImageUrl());
    }

    @Override
    public List<RoomResponse> getAvailableRooms() {
        return roomRepository.findAll().stream()
                .filter(r -> r.getStatus() == Room.RoomStatus.AVAILABLE)
                .map(roomMapper::toRoomResponse)
                .toList();
    }

    @Override
    @CacheEvict(cacheNames = "rooms", allEntries = true)
    public RoomResponse updateRoomStatus(String id, Room.RoomStatus status) {
        Room room = findRoomOrThrow(id);
        Room.RoomStatus oldStatus = room.getStatus();
        room.setStatus(status);
        Room saved = roomRepository.save(room);

        if (status == Room.RoomStatus.MAINTENANCE && oldStatus != Room.RoomStatus.MAINTENANCE) {
            // Find active bookings for this room and notify users
            List<org.example.hotelm.booking.entity.Booking> activeBookings = bookingRepository.findByRoom_RoomIDAndStatusIn(
                    id, 
                    List.of(org.example.hotelm.booking.entity.Booking.BookingStatus.PENDING, 
                            org.example.hotelm.booking.entity.Booking.BookingStatus.CONFIRMED, 
                            org.example.hotelm.booking.entity.Booking.BookingStatus.CHECKED_IN)
            );

            activeBookings.forEach(booking -> {
                if (booking.getUser() != null) {
                    notificationService.createAndPush(
                            booking.getUser().getUserID(),
                            "Room Maintenance Alert",
                            "The room " + room.getRoomName() + " for your booking " + booking.getBookingID() + " is currently under maintenance. Please contact support.",
                            org.example.hotelm.notification.entity.Notification.NotificationType.SYSTEM,
                            booking.getBookingID()
                    );
                }
            });
        }

        return roomMapper.toRoomResponse(saved);
    }


    // Helpers

    private Room findRoomOrThrow(String id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với ID: " + id));
    }

    private RoomType findRoomTypeOrThrow(String id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại phòng với ID: " + id));
    }

    private void deleteImageFromCloudinary(String imageUrl) {
        if (imageUrl != null && imageUrl.contains("res.cloudinary.com")) {
            try {
                int uploadIdx = imageUrl.indexOf("/upload/");
                if (uploadIdx != -1) {
                    String afterUpload = imageUrl.substring(uploadIdx + 8);
                    int firstSlash = afterUpload.indexOf('/');
                    String path = afterUpload;
                    if (afterUpload.matches("^v\\d+/.*")) {
                        path = afterUpload.substring(firstSlash + 1);
                    }
                    int lastDot = path.lastIndexOf('.');
                    String publicId = lastDot != -1 ? path.substring(0, lastDot) : path;
                    cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                }
            } catch (Exception e) {
                System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
            }
        }
    }
    @Override
    public List<RoomResponse> getRoomsByBranch(String branchId) {
        return roomRepository.findByBranch_BranchId(branchId)
                .stream()
                .map(roomMapper::toRoomResponse)
                .toList();
    }

    @Override
    public List<RoomResponse> getAvailableRoomsByBranch(String branchId) {
        return roomRepository.findByBranch_BranchIdAndStatus(branchId, Room.RoomStatus.AVAILABLE)
                .stream()
                .map(roomMapper::toRoomResponse)
                .toList();
    }
}