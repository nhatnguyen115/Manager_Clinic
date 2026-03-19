package com.clinic.service;

import com.clinic.dto.request.ChatRequest;
import com.clinic.dto.response.ChatResponse;
import com.clinic.util.SecurityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private GeminiService geminiService;
    @Mock
    private ChatFunctionService chatFunctionService;
    @Mock
    private SecurityUtils securityUtils;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ChatService chatService;

    @BeforeEach
    void setUp() {
        // Clear history map via reflection to ensure test isolation
        ReflectionTestUtils.setField(chatService, "chatHistoryMap", new ConcurrentHashMap<>());
    }

    @Test
    void processChat_ShouldCallGeminiAndReturnResponse() {
        UUID userId = UUID.randomUUID();
        ChatRequest request = new ChatRequest();
        request.setMessage("Hello");
        
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(userId));
        when(geminiService.chat(anyString(), anyString(), anyList(), anyList()))
                .thenReturn("Hi there!");

        ChatResponse response = chatService.processChat(request);

        assertNotNull(response);
        assertEquals("Hi there!", response.getMessage());
        verify(geminiService, times(1)).chat(eq("Hello"), anyString(), anyList(), anyList());
    }

    @Test
    void processChat_ShouldMaintainHistory() {
        UUID userId = UUID.randomUUID();
        ChatRequest request1 = new ChatRequest();
        request1.setMessage("Message 1");
        
        ChatRequest request2 = new ChatRequest();
        request2.setMessage("Message 2");

        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(userId));
        when(geminiService.chat(anyString(), anyString(), anyList(), anyList()))
                .thenReturn("Response");

        chatService.processChat(request1);
        chatService.processChat(request2);

        // Check history map
        @SuppressWarnings("unchecked")
        Map<UUID, List<Map<String, Object>>> historyMap = 
            (Map<UUID, List<Map<String, Object>>>) ReflectionTestUtils.getField(chatService, "chatHistoryMap");
        
        assertNotNull(historyMap);
        List<Map<String, Object>> userHistory = historyMap.get(userId);
        
        // Each call adds 1 User message and 1 Assistant message (via updateHistory)
        // Total should be 4 messages (2 pairs)
        assertEquals(4, userHistory.size());
        assertEquals("user", userHistory.get(0).get("role"));
        assertEquals("model", userHistory.get(1).get("role"));
    }
}
