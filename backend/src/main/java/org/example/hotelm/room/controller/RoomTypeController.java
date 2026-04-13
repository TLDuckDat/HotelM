package org.example.hotelm.room.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.room.dto.RoomTypeCreateRequest;
import org.example.hotelm.room.dto.RoomTypeResponse;
import org.example.hotelm.room.service.RoomTypeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/room-types")
@RequiredArgsConstructor

public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    @GetMapping
    public List<RoomTypeResponse> getAll() {
        return roomTypeService.getAllRoomTypes();
    }

    @GetMapping("/{id}")
    public RoomTypeResponse getById(@PathVariable String id) {
        return roomTypeService.getRoomTypeById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomTypeResponse create(@Valid @RequestBody RoomTypeCreateRequest request) {
        return roomTypeService.createRoomType(request);
    }

    @PutMapping("/{id}")
    public RoomTypeResponse update(@PathVariable String id,
                                   @Valid @RequestBody RoomTypeCreateRequest request) {
        return roomTypeService.updateRoomType(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        roomTypeService.deleteRoomType(id);
    }
}