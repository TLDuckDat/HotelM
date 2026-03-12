package org.example.hotelm.controller;

import org.example.hotelm.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.example.hotelm.model.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public class RoomController {
    @Autowired
    private RoomService roomService;

    @GetMapping
    public List<Room> getRooms(){
        return roomService.getAllRooms();
    }

    @PostMapping
    public Room createRoom(@RequestBody Room room){
        return roomService.saveRoom(room);
    }
}
