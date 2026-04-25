package com.clinic.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    private String message;
    private String role; // "assistant"
    private LocalDateTime timestamp;

    public static ChatResponse of(String message) {
        return ChatResponse.builder()
                .message(message)
                .role("assistant")
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static ChatResponse error(String errorMessage) {
        return ChatResponse.builder()
                .message(errorMessage)
                .role("assistant")
                .timestamp(LocalDateTime.now())
                .build();
    }
}
