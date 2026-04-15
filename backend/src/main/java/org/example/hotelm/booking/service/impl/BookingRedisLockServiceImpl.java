package org.example.hotelm.booking.service.impl;

import io.lettuce.core.SetArgs;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hotelm.booking.service.BookingRedisLockService;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingRedisLockServiceImpl implements BookingRedisLockService {

    private final StatefulRedisConnection<String, byte[]> redisConnection;

    private static final String LOCK_VALUE = "1";

    @Override
    public boolean tryLock(String key, long ttlSeconds) {
        try {
            RedisCommands<String, byte[]> commands = redisConnection.sync();
            String result = commands.set(
                    key,
                    LOCK_VALUE.getBytes(StandardCharsets.UTF_8),
                    SetArgs.Builder.nx().ex(ttlSeconds)
            );
            boolean locked = "OK".equals(result);
            if (locked) log.debug("Lock acquired: {}", key);
            else log.debug("Lock already held: {}", key);
            return locked;
        } catch (Exception e) {
            log.error("Redis tryLock error for key={}", key, e);
            return true; // Fail-open: nếu Redis down thì vẫn cho chạy
        }
    }

    @Override
    public void unlock(String key) {
        try {
            redisConnection.sync().del(key);
            log.debug("Lock released: {}", key);
        } catch (Exception e) {
            log.error("Redis unlock error for key={}", key, e);
        }
    }
}