package org.example.hotelm.room.service;

import org.example.hotelm.room.dto.RoomCreateRequest;
import org.example.hotelm.room.dto.RoomResponse;
import org.example.hotelm.room.dto.RoomUpdateRequest;
import org.example.hotelm.room.entity.Room;

import java.util.List;

public interface RoomService {
    List<RoomResponse> getAllRooms();
    RoomResponse getRoomById(String id);
    RoomResponse createRoom(RoomCreateRequest request);
    RoomResponse updateRoom(String id, RoomUpdateRequest request);
    void deleteRoom(String id);
    List<RoomResponse> getAvailableRooms();
    RoomResponse updateRoomStatus(String id, Room.RoomStatus status);
}