package org.example.hotelm.service;

import org.example.hotelm.model.Room;
import org.example.hotelm.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(String id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy phòng với ID: " + id));
    }

    public Room saveRoom(Room room) {
        if (room.getStatus() == null)
            room.setStatus(Room.RoomStatus.AVAILABLE); // mặc định AVAILABLE
        return roomRepository.save(room);
    }

    public Room updateRoom(String id, Room updated) {
        Room existing = getRoomById(id);
        existing.setRoomName(updated.getRoomName());
        existing.setMaxCapacity(updated.getMaxCapacity());
        existing.setDescription(updated.getDescription());
        existing.setImageUrl(updated.getImageUrl());
        existing.setStatus(updated.getStatus());
        if (updated.getRoomType() != null)
            existing.setRoomType(updated.getRoomType());
        return roomRepository.save(existing);
    }

    public void deleteRoom(String id) {
        if (!roomRepository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Không tìm thấy phòng với ID: " + id);
        roomRepository.deleteById(id);
    }

    public List<Room> getAvailableRooms() {
        return roomRepository.findAll().stream()
                .filter(r -> r.getStatus() == Room.RoomStatus.AVAILABLE)
                .toList();
    }
}