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
                review.getRoom() == null ? null : review.getRoom().getRoomID(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}