package org.example.hotelm.review.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.review.dto.ReviewCreateRequest;
import org.example.hotelm.review.dto.ReviewResponse;
import org.example.hotelm.review.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable String id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ReviewResponse>> getByRoomId(@PathVariable String roomId) {
        return ResponseEntity.ok(reviewService.getReviewsByRoomId(roomId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponse>> getByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(reviewService.getReviewsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}