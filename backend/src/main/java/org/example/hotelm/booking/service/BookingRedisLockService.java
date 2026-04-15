package org.example.hotelm.booking.service;

public interface BookingRedisLockService {
    /**
     * Cố gắng acquire lock.
     * @param key        lock key (vd: "booking:lock:room:abc123")
     * @param ttlSeconds thời gian tự động giải phóng lock nếu process crash
     * @return true nếu lock thành công, false nếu đã bị lock bởi process khác
     */
    boolean tryLock(String key, long ttlSeconds);

    /**
     * Giải phóng lock.
     */
    void unlock(String key);
}
