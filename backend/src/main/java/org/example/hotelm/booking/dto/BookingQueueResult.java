package org.example.hotelm.booking.dto;


import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record BookingQueueResult(
        Status status,
        BookingResponse data,  // NON-NULL khi SUCCESS
        String message         // NON-NULL  khi FAILED hoặc NOT_FOUND
) {
    public enum Status {
        PENDING,        // ĐANG CHỜ Ở QUEUE
        SUCCESS,        // ĐẶT PHÒNG THÀNH CÔNG
        FAILED,         // ĐẶT PHÒNG THẤT BẠI
        NOT_FOUND       // Request ID không tồn tại
    }

    public static BookingQueueResult pending() {
        return new BookingQueueResult(Status.PENDING, null, null);
    }

    public static BookingQueueResult success(BookingResponse data) {
        return new BookingQueueResult(Status.SUCCESS, data, null);
    }

    public static BookingQueueResult failed(String message) {
        return new BookingQueueResult(Status.FAILED, null, message);
    }

    public static BookingQueueResult notFound() {
        return new BookingQueueResult(Status.NOT_FOUND, null,
                "Request ID không tồn tại hoặc đã hết hạn");
    }

}
