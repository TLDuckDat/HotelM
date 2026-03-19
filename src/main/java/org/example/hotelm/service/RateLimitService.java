package org.example.hotelm.service;

import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.example.hotelm.config.RateLimitConfig;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final LettuceBasedProxyManager<String> proxyManager;
    private final RateLimitConfig config;

    // Cache BucketConfiguration để tránh tạo lại mỗi request
    private final Map<String, BucketConfiguration> configCache =
            new ConcurrentHashMap<>();

    public RateLimitResult tryConsume(String key, String limitType, long tokens) {
        if (!config.isEnabled())
            return RateLimitResult.allowed(-1);

        try {
            var bucketConfig = configCache.computeIfAbsent(
                    limitType, k -> resolveBucketConfig(limitType));

            var bucket = proxyManager.builder()
                    .build(key, bucketConfig);

            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(tokens);

            if (probe.isConsumed()) {
                return RateLimitResult.allowed(probe.getRemainingTokens());
            } else {
                long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
                log.warn("Rate limit exceeded: key={}, retryAfter={}s", key, waitSeconds);
                return RateLimitResult.denied(waitSeconds);
            }

        } catch (Exception e) {
            // Fail open — không block request khi Redis lỗi
            log.error("Rate limit check failed for key={}, failing open", key, e);
            return RateLimitResult.allowed(-1);
        }
    }

    private BucketConfiguration resolveBucketConfig(String limitType) {
        return switch (limitType) {
            case "api" -> config.getApi().toBucketConfiguration();
            default    -> config.getDefaultProps().toBucketConfiguration();
        };
    }

    @Value   // lombok @Value — tạo immutable class, tất cả field final
    @Builder
    public static class RateLimitResult {
        boolean allowed;
        long remainingTokens;
        long retryAfterSeconds;

        public static RateLimitResult allowed(long remaining) {
            return RateLimitResult.builder()
                    .allowed(true)
                    .remainingTokens(remaining)
                    .build();
        }

        public static RateLimitResult denied(long retryAfter) {
            return RateLimitResult.builder()
                    .allowed(false)
                    .retryAfterSeconds(retryAfter)
                    .build();
        }
    }
}