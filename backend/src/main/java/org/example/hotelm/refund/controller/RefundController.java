package org.example.hotelm.refund.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.refund.dto.RefundCreateRequest;
import org.example.hotelm.refund.dto.RefundResponse;
import org.example.hotelm.refund.entity.RefundRequest;
import org.example.hotelm.refund.service.RefundService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @GetMapping
    public ResponseEntity<List<RefundResponse>> getRefunds() {
        return ResponseEntity.ok(refundService.getAllRefunds());
    }

    @PostMapping
    public ResponseEntity<RefundResponse> createRefund(@Valid @RequestBody RefundCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(refundService.createRefund(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RefundResponse> updateRefundStatus(
            @PathVariable String id,
            @RequestParam RefundRequest.RefundStatus status
    ) {
        return ResponseEntity.ok(refundService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRefund(@PathVariable String id) {
        refundService.deleteRefund(id);
        return ResponseEntity.noContent().build();
    }
}

