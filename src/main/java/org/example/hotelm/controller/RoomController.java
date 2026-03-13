package org.example.hotelm.controller;

import org.example.hotelm.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.example.hotelm.model.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
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
