package org.example.hotelm.room.repository;

import org.example.hotelm.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {

    List<Room> findByStatus(Room.RoomStatus status);
    List<Room> findByBranch_BranchId(String branchId);
    List<Room> findByBranch_BranchIdAndStatus(String branchId, Room.RoomStatus status);

}