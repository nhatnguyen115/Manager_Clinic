package com.clinic.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.clinic.util.SecurityUtils;
import com.clinic.repository.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class ChatServiceTest {

    @InjectMocks
    private ChatService chatService;

    @Mock private GeminiService geminiService;
    @Mock private ChatFunctionService chatFunctionService;
    @Mock private SecurityUtils securityUtils;
    @Mock private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRepairHistory() throws Exception {
        // Access private method using reflection for simple test
        java.lang.reflect.Method repairMethod = ChatService.class.getDeclaredMethod("repairHistory", List.class);
        repairMethod.setAccessible(true);

        // Case 1: Incomplete model turn (functionCall instead of text)
        List<Map<String, Object>> history1 = new ArrayList<>();
        history1.add(Map.of("role", "user", "parts", List.of(Map.of("text", "Hi"))));
        history1.add(Map.of("role", "model", "parts", List.of(Map.of("functionCall", Map.of("name", "test")))));
        
        repairMethod.invoke(chatService, history1);
        
        assertEquals(0, history1.size(), "Should remove both model call and orphaned user message");

        // Case 2: Orphaned function response
        List<Map<String, Object>> history2 = new ArrayList<>();
        history2.add(Map.of("role", "user", "parts", List.of(Map.of("text", "Hi"))));
        history2.add(Map.of("role", "model", "parts", List.of(Map.of("text", "Hello"))));
        history2.add(Map.of("role", "user", "parts", List.of(Map.of("text", "Call func"))));
        history2.add(Map.of("role", "model", "parts", List.of(Map.of("functionCall", Map.of("name", "test")))));
        history2.add(Map.of("role", "function", "parts", List.of(Map.of("text", "result"))));
        
        repairMethod.invoke(chatService, history2);
        
        assertEquals(2, history2.size(), "Should remove everything until the last complete model text turn");
    }

    @Test
    void testTruncateHistory() throws Exception {
        java.lang.reflect.Method truncateMethod = ChatService.class.getDeclaredMethod("truncateHistory", List.class);
        truncateMethod.setAccessible(true);

        List<Map<String, Object>> history = new ArrayList<>();
        // Add 5 turns (10 messages)
        for (int i = 0; i < 5; i++) {
            history.add(Map.of("role", "user", "parts", List.of(Map.of("text", "U" + i))));
            history.add(Map.of("role", "model", "parts", List.of(Map.of("text", "M" + i))));
        }

        // Set MAX_HISTORY_SIZE is private 20, let's just test the logic with a large one manually if needed
        // But the first turn must be "user" check is easy
        history.add(0, Map.of("role", "model", "parts", List.of(Map.of("text", "Bad start"))));
        
        truncateMethod.invoke(chatService, history);
        
        assertEquals("user", history.get(0).get("role"), "First message must be user");
    }
}
