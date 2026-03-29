package org.example.hotelm.review.service;

import org.example.hotelm.review.dto.ReviewCreateRequest;
import org.example.hotelm.review.dto.ReviewResponse;

import java.util.List;

public interface ReviewService {
    List<ReviewResponse> getAllReviews();
    ReviewResponse getReviewById(String id);
    List<ReviewResponse> getReviewsByRoomId(String roomId);
    List<ReviewResponse> getReviewsByUserId(String userId);
    ReviewResponse createReview(ReviewCreateRequest request);
    void deleteReview(String id);
}