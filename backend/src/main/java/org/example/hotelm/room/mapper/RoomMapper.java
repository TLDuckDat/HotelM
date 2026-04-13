package org.example.hotelm.room.mapper;

import org.example.hotelm.room.dto.*;
import org.example.hotelm.room.entity.Room;
import org.example.hotelm.room.entity.RoomType;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {

    // RoomType mappings
    public RoomTypeResponse toRoomTypeResponse(RoomType roomType) {
        return RoomTypeResponse.builder()
                .typeId(roomType.getTypeID())
                .typeName(roomType.getTypeName())
                .basePrice(roomType.getBasePrice())
                .description(roomType.getDescription())
                .build();
    }

    public RoomType toRoomTypeEntity(RoomTypeCreateRequest request) {
        RoomType roomType = new RoomType();
        roomType.setTypeName(request.getTypeName().trim());
        roomType.setBasePrice(request.getBasePrice());
        roomType.setDescription(request.getDescription());
        return roomType;
    }

    // Room mappings
    public RoomResponse toRoomResponse(Room room) {
        RoomResponse.RoomResponseBuilder builder = RoomResponse.builder()
                .roomId(room.getRoomID())
                .roomName(room.getRoomName())
                .maxCapacity(room.getMaxCapacity())
                .status(room.getStatus())
                .description(room.getDescription())
                .imageUrl(room.getImageUrl());

        if (room.getRoomType() != null) {
            builder.roomTypeId(room.getRoomType().getTypeID())
                    .roomTypeName(room.getRoomType().getTypeName())
                    .basePrice(room.getRoomType().getBasePrice());
        }

        if (room.getBranch() != null) {
            builder.branchId(room.getBranch().getBranchId())
                    .branchName(room.getBranch().getBranchName());
        }
        return builder.build();
    }

    // roomType sẽ được gán trong Service sau khi tìm từ DB theo roomTypeId
    public Room toRoomEntity(RoomCreateRequest request) {
        Room room = new Room();
        room.setRoomName(request.getRoomName().trim());
        room.setMaxCapacity(request.getMaxCapacity());
        room.setDescription(request.getDescription());
        room.setImageUrl(request.getImageUrl());
        room.setStatus(Room.RoomStatus.AVAILABLE);
        return room;
    }

    // Chỉ update các field không null — roomType sẽ do Service xử lý riêng
    public void applyUpdate(RoomUpdateRequest request, Room existing) {
        if (request.getRoomName() != null) {
            existing.setRoomName(request.getRoomName().trim());
        }
        if (request.getMaxCapacity() != null) {
            existing.setMaxCapacity(request.getMaxCapacity());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            existing.setImageUrl(request.getImageUrl());
        }
        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }
    }
}