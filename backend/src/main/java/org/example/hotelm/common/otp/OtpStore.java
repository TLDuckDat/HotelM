package org.example.hotelm.common.otp;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class OtpStore {

    private final StringRedisTemplate redisTemplate;
    private static final String OTP_PREFIX = "otp:";

    public void save(String email, String otp, long ttlSeconds) {
        if (email == null || otp == null || ttlSeconds <= 0) {
            return;
        }
        String key = OTP_PREFIX + email.trim().toLowerCase();
        redisTemplate.opsForValue().set(key, otp, Duration.ofSeconds(ttlSeconds));
    }

    public boolean verify(String email, String otp) {
        if (email == null || otp == null) {
            return false;
        }
        String key = OTP_PREFIX + email.trim().toLowerCase();
        String storedOtp = redisTemplate.opsForValue().get(key);
        if (storedOtp != null && storedOtp.equals(otp)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }

    public void remove(String email) {
        if (email == null) {
            return;
        }
        String key = OTP_PREFIX + email.trim().toLowerCase();
        redisTemplate.delete(key);
    }
}