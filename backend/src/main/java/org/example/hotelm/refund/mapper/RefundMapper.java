package org.example.hotelm.refund.mapper;

import org.example.hotelm.refund.dto.RefundResponse;
import org.example.hotelm.refund.entity.RefundRequest;
import org.springframework.stereotype.Component;

@Component
public class RefundMapper {
    public RefundResponse toResponse(RefundRequest refund) {
        return new RefundResponse(
                refund.getRefundId(),
                refund.getBooking() != null ? refund.getBooking().getBookingID() : null,
                refund.getUser() != null ? refund.getUser().getUserID() : null,
                refund.getUser() != null ? refund.getUser().getFullName() : null,
                refund.getReason(),
                refund.getStatus(),
                refund.getCreatedAt(),
                refund.getReviewedAt()
        );
    }
}

