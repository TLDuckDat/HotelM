package org.example.hotelm.service;

import org.example.hotelm.model.Room;
import org.example.hotelm.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms(){
        return roomRepository.findAll();
    }

    public Room saveRoom(Room room){
        return roomRepository.save(room);
    }
}