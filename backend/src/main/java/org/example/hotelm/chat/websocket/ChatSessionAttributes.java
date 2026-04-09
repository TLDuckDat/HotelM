package org.example.hotelm.chat.websocket;

/**
 * Tên các attribute được lưu trong HTTP session khi WebSocket handshake.
 * Dùng làm key nhất quán giữa interceptor và các component khác.
 */
public final class ChatSessionAttributes {

    private ChatSessionAttributes() {}

    /** Key lưu userId trong HTTP session attributes. */
    public static final String USER_ID = "userId";
}