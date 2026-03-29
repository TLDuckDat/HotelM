package org.example.hotelm.review.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.example.hotelm.review.dto.ReviewCreateRequest;
import org.example.hotelm.review.dto.ReviewResponse;
import org.example.hotelm.review.entity.Review;
import org.example.hotelm.review.mapper.ReviewMapper;
import org.example.hotelm.review.repository.ReviewRepository;
import org.example.hotelm.review.service.ReviewService;
import org.example.hotelm.room.entity.Room;
import org.example.hotelm.room.repository.RoomRepository;
import org.example.hotelm.user.entity.User;
import org.example.hotelm.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    @Override
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Override
    public ReviewResponse getReviewById(String id) {
        return reviewMapper.toResponse(findOrThrow(id));
    }

    @Override
    public List<ReviewResponse> getReviewsByRoomId(String roomId) {
        return reviewRepository.findByRoom_RoomID(roomId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Override
    public List<ReviewResponse> getReviewsByUserId(String userId) {
        return reviewRepository.findByUser_UserID(userId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Override
    public ReviewResponse createReview(ReviewCreateRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + request.userId()));

        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng: " + request.roomId()));

        Review review = new Review();
        review.setUser(user);
        review.setRoom(room);
        review.setRating(request.rating());
        review.setComment(request.comment());
        review.setCreatedAt(LocalDateTime.now());

        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Override
    public void deleteReview(String id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy review với ID: " + id);
        }
        reviewRepository.deleteById(id);
    }

    private Review findOrThrow(String id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy review với ID: " + id));
    }
}