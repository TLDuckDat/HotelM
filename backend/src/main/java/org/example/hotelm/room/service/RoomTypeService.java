package org.example.hotelm.room.service;

import org.example.hotelm.room.dto.RoomTypeCreateRequest;
import org.example.hotelm.room.dto.RoomTypeResponse;

import java.util.List;

public interface RoomTypeService {
    List<RoomTypeResponse> getAllRoomTypes();

    RoomTypeResponse getRoomTypeById(String id);
    RoomTypeResponse createRoomType(RoomTypeCreateRequest request);
    RoomTypeResponse updateRoomType(String id, RoomTypeCreateRequest request);
    void deleteRoomType(String id);
}