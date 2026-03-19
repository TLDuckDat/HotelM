package org.example.hotelm.repository;

import org.example.hotelm.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository

// extends JpaRepository để không phải tự viết Query chay\
public interface RoomTypeRepository extends JpaRepository<RoomType, String> {
    Optional<RoomType> findByTypeNameIgnoreCase(String typeName);
}

