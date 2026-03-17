package org.example.hotelm.controller;

import org.example.hotelm.model.RoomType;
import org.example.hotelm.service.RoomTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/room-types")
public class RoomTypeController {

    @Autowired
    private RoomTypeService roomTypeService;

    @GetMapping
    public List<RoomType> getAll() {
        return roomTypeService.getAllRoomTypes();
    }

    @GetMapping("/{id}")
    public RoomType getById(@PathVariable String id) {
        return roomTypeService.getRoomTypeById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomType create(@RequestBody RoomType roomType) {
        return roomTypeService.createRoomType(roomType);
    }

    @PutMapping("/{id}")
    public RoomType update(@PathVariable String id, @RequestBody RoomType roomType) {
        return roomTypeService.updateRoomType(id, roomType);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        roomTypeService.deleteRoomType(id);
    }
}

