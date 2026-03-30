package org.example.hotelm.common.config;

import org.example.hotelm.chat.websocket.ChatUserHandshakeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefix cho message từ client gửi lên server (controller)
        registry.setApplicationDestinationPrefixes("/app");

        // Prefix cho topic mà client subscribe để nhận message
        // /topic/chat.thread.{threadId} — broadcast trong một thread
        registry.enableSimpleBroker("/topic");
    }
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/chat")
                .addInterceptors(new ChatUserHandshakeInterceptor())
                // Cho phép tất cả origin trong dev; production nên chỉ định cụ thể.
                .setAllowedOriginPatterns("*")
                .withSockJS(); // Fallback cho browser không hỗ trợ native WebSocket
    }
}