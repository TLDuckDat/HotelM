package org.example.hotelm.review.mapper;

import org.example.hotelm.review.dto.ReviewResponse;
import org.example.hotelm.review.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getReviewID(),
                review.getUser() == null ? null : review.getUser().getUserID(),
                review.getUser() == null ? "Guest" : review.getUser().getFullName(),
                review.getUser() == null ? null : review.getUser().getEmail(),
                review.getRoom() == null ? null : review.getRoom().getRoomID(),
                review.getRoom() == null ? "Unknown Room" : review.getRoom().getRoomName(),
                review.getBookingId(),
                review.getRating(),
                review.getComment(),
                review.getStatus(),
                review.getCreatedAt()
        );
    }
}