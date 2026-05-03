package org.example.hotelm.common.otp;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpStore {

    private record OtpEntry(String otp, Instant expiry) {}

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    public void save(String email, String otp, long ttlSeconds) {
        store.put(email.toLowerCase(),
                new OtpEntry(otp, Instant.now().plusSeconds(ttlSeconds)));
    }

    public boolean verify(String email, String otp) {
        OtpEntry entry = store.get(email.toLowerCase());
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expiry())) {
            store.remove(email.toLowerCase());
            return false;
        }
        return entry.otp().equals(otp);
    }

    public void remove(String email) {
        store.remove(email.toLowerCase());
    }
}