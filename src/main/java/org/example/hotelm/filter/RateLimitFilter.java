package org.example.hotelm.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hotelm.service.RateLimitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    private static final List<String> WHITELIST = List.of(
            "/actuator", "/health", "/favicon.ico"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (isWhitelisted(path)) {
            chain.doFilter(request, response);
            return;
        }

        String key    = resolveKey(request);
        String type   = resolveType(path);
        var    result = rateLimitService.tryConsume(key, type, 1);

        response.setHeader("X-RateLimit-Remaining",
                String.valueOf(result.getRemainingTokens()));

        if (!result.isAllowed()) {
            response.setHeader("Retry-After",
                    String.valueOf(result.getRetryAfterSeconds()));
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("""
                    {"error":"Too Many Requests","retryAfter":%d}
                    """.formatted(result.getRetryAfterSeconds()));
            return;
        }

        chain.doFilter(request, response);
    }

    private String resolveKey(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            // TODO: parse JWT subject để rate limit theo user thay vì IP
            // String token = auth.substring(7);
            // String subject = jwtService.extractSubject(token);
            // return "rl:user:" + subject;
        }
        return "rl:ip:" + getClientIp(request);
    }

    private String resolveType(String path) {
        return path.startsWith("/api/") ? "api" : "default";
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank())
            return xff.split(",")[0].trim();

        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank())
            return realIp.trim();

        return request.getRemoteAddr();
    }

    private boolean isWhitelisted(String path) {
        return WHITELIST.stream().anyMatch(path::startsWith);
    }
}