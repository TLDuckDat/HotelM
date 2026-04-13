package org.example.hotelm.room.repository;

import org.example.hotelm.room.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, String> {

    Optional<RoomType> findByTypeNameIgnoreCase(String typeName);

}