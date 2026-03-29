package org.example.hotelm.review.repository;

import org.example.hotelm.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByRoom_RoomID(String roomId);
    List<Review> findByUser_UserID(String userId);
}