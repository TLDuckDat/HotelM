package org.example.hotelm.common.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@ConfigurationProperties(prefix = "rate-limit")
@Data
public class RateLimitConfig {

    private boolean enabled = true;
    private LimitProps defaultProps = new LimitProps();
    private LimitProps api = new LimitProps();

    @Data
    public static class LimitProps {
        private long capacity = 100;
        private long refillTokens = 100;
        private long refillDurationSeconds = 60;

        public BucketConfiguration toBucketConfiguration() {
            return BucketConfiguration.builder()
                    .addLimit(Bandwidth.builder()
                            .capacity(capacity)
                            .refillGreedy(refillTokens,
                                    Duration.ofSeconds(refillDurationSeconds))
                            .build())
                    .build();
        }
    }
}