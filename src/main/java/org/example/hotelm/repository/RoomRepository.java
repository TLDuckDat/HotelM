package org.example.hotelm.repository;

import org.example.hotelm.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository  extends JpaRepository<Room, Long> {

}
