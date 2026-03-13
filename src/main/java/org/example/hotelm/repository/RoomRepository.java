package org.example.hotelm.repository;

import org.example.hotelm.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

// extends JpaRepository để không phải tự viết Query chay
public interface RoomRepository  extends JpaRepository<Room, Long> {

}
