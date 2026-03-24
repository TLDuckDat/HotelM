package org.example.hotelm.chat;

import org.example.hotelm.model.User;

import java.util.Map;
import java.util.Optional;


public record ChatPrincipal(String userId, String email, User.Role role, String displayName) {

    public static Optional<ChatPrincipal> fromSessionAttributes(Map<String, Object> attrs) {
        if (attrs == null) {
            return Optional.empty();
        }
        Object id = attrs.get(ChatSessionAttributes.USER_ID);
        Object email = attrs.get(ChatSessionAttributes.USER_EMAIL);
        Object role = attrs.get(ChatSessionAttributes.USER_ROLE);
        Object name = attrs.get(ChatSessionAttributes.DISPLAY_NAME);
        if (!(id instanceof String userId)
                || !(email instanceof String userEmail)
                || !(role instanceof User.Role ur)) {
            return Optional.empty();
        }
        String display = name instanceof String s ? s : "";
        return Optional.of(new ChatPrincipal(userId, userEmail, ur, display));
    }
}
