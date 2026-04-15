package org.example.hotelm.booking.service;

import org.example.hotelm.booking.dto.BookingCreateRequest;
import org.example.hotelm.booking.dto.BookingQueueResult;

public interface BookingQueueService {

    /**
     * Đưa yêu cầu đặt phòng vào queue.
     * @return requestId để client polling kết quả
     */
    String enqueue(BookingCreateRequest request);

    /**
     * Lấy kết quả xử lý theo requestId.
     */
    BookingQueueResult getResult(String requestId);
}