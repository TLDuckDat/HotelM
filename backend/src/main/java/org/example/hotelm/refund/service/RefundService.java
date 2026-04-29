package org.example.hotelm.refund.service;

import org.example.hotelm.refund.dto.RefundCreateRequest;
import org.example.hotelm.refund.dto.RefundResponse;
import org.example.hotelm.refund.entity.RefundRequest;

import java.util.List;

public interface RefundService {
    List<RefundResponse> getAllRefunds();

    RefundResponse createRefund(RefundCreateRequest request);

    RefundResponse updateStatus(String refundId, RefundRequest.RefundStatus status);

    void deleteRefund(String refundId);
}

