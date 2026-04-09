package org.example.hotelm.chat.websocket;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Interceptor chạy trong lúc WebSocket handshake (HTTP Upgrade).
 *
 * Nhiệm vụ: lấy {@code userId} từ query param của URL kết nối
 * rồi lưu vào session attributes để dùng cho {@link ChatUserWebSocketHandler}
 * hoặc bất kỳ component nào cần biết danh tính của connection.
 *
 * URL kết nối mẫu:
 *   ws://localhost:8080/ws/chat?userId=abc-123
 *
 * Trong production nên thay query param bằng JWT token để bảo mật hơn.
 */
public class ChatUserHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            String userId = servletRequest.getServletRequest().getParameter("userId");
            if (userId != null && !userId.isBlank()) {
                attributes.put(ChatSessionAttributes.USER_ID, userId);
            }
        }
        // Trả về true để cho phép handshake tiếp tục dù userId có hay không.
        // Có thể trả về false để từ chối kết nối không có userId.
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {
        // Không cần xử lý sau handshake.
    }
}