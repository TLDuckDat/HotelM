package org.example.hotelm.room.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.example.hotelm.room.dto.RoomCreateRequest;
import org.example.hotelm.room.dto.RoomResponse;
import org.example.hotelm.room.dto.RoomUpdateRequest;
import org.example.hotelm.room.entity.Room;
import org.example.hotelm.room.entity.RoomType;
import org.example.hotelm.room.mapper.RoomMapper;
import org.example.hotelm.room.repository.*;
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
        return roomMapper.toRoomResponse(roomRepository.save(room));
    }

    @Override
    @CacheEvict(cacheNames = "rooms", allEntries = true)
    public RoomResponse updateRoom(String id, RoomUpdateRequest request) {
        Room existing = findRoomOrThrow(id);
        roomMapper.applyUpdate(request, existing);

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
        if (!roomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy phòng với ID: " + id);
        }
        roomRepository.deleteById(id);
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
        room.setStatus(status);
        return roomMapper.toRoomResponse(roomRepository.save(room));
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
}