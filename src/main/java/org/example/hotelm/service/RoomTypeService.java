package org.example.hotelm.service;

import org.example.hotelm.model.RoomType;
import org.example.hotelm.repository.RoomTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RoomTypeService {

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }

    public RoomType getRoomTypeById(String id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "RoomType not found"));
    }

    public RoomType createRoomType(RoomType roomType) {
        validate(roomType);

        roomTypeRepository.findByTypeNameIgnoreCase(roomType.getTypeName())
                .ifPresent(rt -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Type name already exists");
                });

        roomType.setTypeID(null);
        return roomTypeRepository.save(roomType);
    }

    public RoomType updateRoomType(String id, RoomType patch) {
        RoomType existing = getRoomTypeById(id);

        if (patch.getTypeName() != null) {
            String newName = patch.getTypeName().trim();
            if (newName.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type name is required");
            }
            roomTypeRepository.findByTypeNameIgnoreCase(newName)
                    .filter(rt -> !rt.getTypeID().equals(existing.getTypeID()))
                    .ifPresent(rt -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Type name already exists");
                    });
            existing.setTypeName(newName);
        }

        if (patch.getBasePrice() != null) {
            if (patch.getBasePrice() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Base price must be >= 0");
            }
            existing.setBasePrice(patch.getBasePrice());
        }

        if (patch.getDescription() != null) {
            existing.setDescription(patch.getDescription());
        }

        return roomTypeRepository.save(existing);
    }

    public void deleteRoomType(String id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "RoomType not found");
        }
        roomTypeRepository.deleteById(id);
    }

    private void validate(RoomType roomType) {
        if (roomType == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RoomType is required");
        }
        if (roomType.getTypeName() == null || roomType.getTypeName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type name is required");
        }
        roomType.setTypeName(roomType.getTypeName().trim());
        if (roomType.getBasePrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Base price is required");
        }
        if (roomType.getBasePrice() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Base price must be >= 0");
        }
    }
}

