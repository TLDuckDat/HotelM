package org.example.hotelm.chat.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.chat.dto.ChatMessageRequest;
import org.example.hotelm.chat.dto.ChatMessageResponse;
import org.example.hotelm.chat.dto.ChatThreadResponse;
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

    @GetMapping("/threads/{threadId}")
    public ResponseEntity<ChatThreadResponse> getThread(@PathVariable String threadId) {
        return ResponseEntity.ok(chatMapper.toThreadResponse(chatService.getThreadById(threadId)));
    }

    @GetMapping("/users/{userId}/threads")
    public ResponseEntity<List<ChatThreadResponse>> getThreadsByUser(@PathVariable String userId) {
        List<ChatThreadResponse> data = chatService.getThreadsByUserId(userId).stream()
                .map(chatMapper::toThreadResponse)
                .toList();
        return ResponseEntity.ok(data);
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(@Valid @RequestBody ChatMessageRequest request) {
        ChatMessageResponse data = chatMapper.toMessageResponse(chatService.sendMessage(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(data);
    }
}
