package com.clinic.controller;

import com.clinic.dto.request.ChatRequest;
import com.clinic.dto.response.ChatResponse;
import com.clinic.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * Endpoint nhận tin nhắn từ người dùng và trả về phản hồi từ AI.
     * Chỉ cho phép người dùng đã đăng nhập (PATIENT, DOCTOR, ADMIN) sử dụng.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.processChat(request));
    }
}
