package org.example.hotelm.room.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.common.exception.BadRequestException;
import org.example.hotelm.common.exception.ConflictException;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.example.hotelm.room.dto.RoomTypeCreateRequest;
import org.example.hotelm.room.dto.RoomTypeResponse;
import org.example.hotelm.room.entity.RoomType;
import org.example.hotelm.room.mapper.RoomMapper;
import org.example.hotelm.room.repository.RoomTypeRepository;
import org.example.hotelm.room.service.RoomTypeService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomTypeServiceImpl implements RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final RoomMapper roomMapper;

    @Override
    public List<RoomTypeResponse> getAllRoomTypes() {
        return roomTypeRepository.findAll()
                .stream()
                .map(roomMapper::toRoomTypeResponse)
                .toList();
    }

    @Override
    public RoomTypeResponse getRoomTypeById(String id) {
        return roomMapper.toRoomTypeResponse(findOrThrow(id));
    }

    @Override
    public RoomTypeResponse createRoomType(RoomTypeCreateRequest request) {
        // Kiểm tra trùng tên
        roomTypeRepository.findByTypeNameIgnoreCase(request.getTypeName().trim())
                .ifPresent(rt -> {
                    throw new ConflictException("Loại phòng '" + request.getTypeName() + "' đã tồn tại");
                });

        RoomType entity = roomMapper.toRoomTypeEntity(request);
        return roomMapper.toRoomTypeResponse(roomTypeRepository.save(entity));
    }

    @Override
    public RoomTypeResponse updateRoomType(String id, RoomTypeCreateRequest request) {
        RoomType existing = findOrThrow(id);

        if (request.getTypeName() != null) {
            String newName = request.getTypeName().trim();
            if (newName.isEmpty()) {
                throw new BadRequestException("Type name is required");
            }
            // Kiểm tra trùng tên với loại phòng khác
            roomTypeRepository.findByTypeNameIgnoreCase(newName)
                    .filter(rt -> !rt.getTypeID().equals(existing.getTypeID()))
                    .ifPresent(rt -> {
                        throw new ConflictException("Loại phòng '" + newName + "' đã tồn tại");
                    });
            existing.setTypeName(newName);
        }

        if (request.getBasePrice() != null) {
            if (request.getBasePrice() < 0) {
                throw new BadRequestException("Base price must be >= 0");
            }
            existing.setBasePrice(request.getBasePrice());
        }

        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }

        return roomMapper.toRoomTypeResponse(roomTypeRepository.save(existing));
    }

    @Override
    public void deleteRoomType(String id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy loại phòng với ID: " + id);
        }
        roomTypeRepository.deleteById(id);
    }

    // Helper

    private RoomType findOrThrow(String id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại phòng với ID: " + id));
    }
}