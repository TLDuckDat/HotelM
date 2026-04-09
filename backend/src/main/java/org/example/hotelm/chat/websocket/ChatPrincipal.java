package org.example.hotelm.chat.websocket;

import java.security.Principal;

/**
 * Đại diện cho danh tính của user trong một WebSocket session.
 * Được tạo ra bởi {@link ChatUserHandshakeInterceptor} lúc handshake.
 */
public class ChatPrincipal implements Principal {

    private final String name; // userId

    public ChatPrincipal(String userId) {
        this.name = userId;
    }

    /** Trả về userId của user đang giữ kết nối WebSocket này. */
    @Override
    public String getName() {
        return name;
    }
}