package org.example.hotelm.repository;

import org.example.hotelm.model.ChatThread;
import org.example.hotelm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatThreadRepository extends JpaRepository<ChatThread, String> {

    Optional<ChatThread> findByGuest(User guest);
}
