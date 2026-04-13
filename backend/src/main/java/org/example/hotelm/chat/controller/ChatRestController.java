package org.example.hotelm.chat.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.chat.dto.*;
import org.example.hotelm.chat.mapper.ChatMapper;
import org.example.hotelm.chat.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;
    private final ChatMapper chatMapper;
    /**
     * GET /chat/staff
     * Trả về danh sách ADMIN + RECEPTIONIST đang ACTIVE.
     * Guest gọi endpoint này để biết ai đang sẵn sàng hỗ trợ.
     */
    @GetMapping("/staff")
    public ResponseEntity<List<StaffUserResponse>> getAvailableStaff() {
        List<StaffUserResponse> data = chatService.getAvailableStaff().stream()
                .map(chatMapper::toStaffUserResponse)
                .toList();
        return ResponseEntity.ok(data);
    }
    /**
     * POST /chat/threads
     * Guest tạo thread với một staff cụ thể.
     * Nếu thread đã tồn tại giữa cặp (guest, staff) thì trả về thread cũ (200 OK).
     * Nếu tạo mới thì trả về 201 Created.
     */
    @PostMapping("/threads")
    public ResponseEntity<ChatThreadResponse> createThread(@Valid @RequestBody CreateThreadRequest request) {
        var thread = chatService.createThread(request);
        ChatThreadResponse data = chatMapper.toThreadResponse(thread);
        // Không có cách đơn giản để biết "mới tạo" hay "đã có" từ ngoài service,
        // nên dùng 200 cho cả hai trường hợp để đơn giản.
        return ResponseEntity.ok(data);
    }

    /**
     * GET /chat/threads/{threadId}
     * Lấy chi tiết một thread (kèm toàn bộ tin nhắn).
     */
    @GetMapping("/threads/{threadId}")
    public ResponseEntity<ChatThreadResponse> getThread(@PathVariable String threadId) {
        return ResponseEntity.ok(chatMapper.toThreadResponse(chatService.getThreadById(threadId)));
    }

    /**
     * GET /chat/users/{userId}/threads
     * Lấy tất cả thread của một user (guest hoặc staff).
     */
    @GetMapping("/users/{userId}/threads")
    public ResponseEntity<List<ChatThreadResponse>> getThreadsByUser(@PathVariable String userId) {
        List<ChatThreadResponse> data = chatService.getThreadsByUserId(userId).stream()
                .map(chatMapper::toThreadResponse)
                .toList();
        return ResponseEntity.ok(data);
    }
    /**
     * POST /chat/messages
     * Gửi tin nhắn qua REST (dùng khi WebSocket không khả dụng).
     */
    @PostMapping("/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(@Valid @RequestBody ChatMessageRequest request) {
        ChatMessageResponse data = chatMapper.toMessageResponse(chatService.sendMessage(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(data);
    }
}