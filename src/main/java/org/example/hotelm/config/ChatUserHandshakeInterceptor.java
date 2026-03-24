package org.example.hotelm.config;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.chat.ChatSessionAttributes;
import org.example.hotelm.model.User;
import org.example.hotelm.repository.UserRepository;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ChatUserHandshakeInterceptor implements HandshakeInterceptor {

    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            return false;
        }
        String email = servletRequest.getServletRequest().getParameter("email");
        if (email == null || email.isBlank()) {
            return false;
        }
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        return userRepository.findByEmail(normalizedEmail)
                .filter(this::isActiveAccount)
                .map(user -> {
                    attributes.put(ChatSessionAttributes.USER_ID, user.getUserID());
                    attributes.put(ChatSessionAttributes.USER_EMAIL, user.getEmail());
                    attributes.put(ChatSessionAttributes.USER_ROLE, user.getRole());
                    attributes.put(ChatSessionAttributes.DISPLAY_NAME,
                            user.getFullName() != null ? user.getFullName() : "");
                    return true;
                })
                .orElse(false);
    }

    private boolean isActiveAccount(User user) {
        if (user.getStatus() == null) {
            return true;
        }
        return user.getStatus() == User.UserStatus.ACTIVE;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // no-op
    }
}
