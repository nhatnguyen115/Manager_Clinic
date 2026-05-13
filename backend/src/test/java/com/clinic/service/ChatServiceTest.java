package com.clinic.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.clinic.util.SecurityUtils;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class ChatServiceTest {

    @InjectMocks
    private ChatService chatService;

    @Mock private OpenAIService openAIService;
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

        // Case 1: Incomplete assistant turn (tool_calls instead of text content)
        List<Map<String, Object>> history1 = new ArrayList<>();
        Map<String, Object> userMsg1 = new HashMap<>();
        userMsg1.put("role", "user");
        userMsg1.put("content", "Hi");
        history1.add(userMsg1);

        Map<String, Object> assistantMsg1 = new HashMap<>();
        assistantMsg1.put("role", "assistant");
        assistantMsg1.put("content", null); // tool_calls response has null content
        assistantMsg1.put("tool_calls", List.of(Map.of("id", "call_123", "type", "function")));
        history1.add(assistantMsg1);
        
        repairMethod.invoke(chatService, history1);
        
        assertEquals(0, history1.size(), "Should remove both assistant call and orphaned user message");

        // Case 2: Orphaned tool response
        List<Map<String, Object>> history2 = new ArrayList<>();
        Map<String, Object> userMsg2 = new HashMap<>();
        userMsg2.put("role", "user");
        userMsg2.put("content", "Hi");
        history2.add(userMsg2);

        Map<String, Object> assistantMsg2 = new HashMap<>();
        assistantMsg2.put("role", "assistant");
        assistantMsg2.put("content", "Hello");
        history2.add(assistantMsg2);

        Map<String, Object> userMsg3 = new HashMap<>();
        userMsg3.put("role", "user");
        userMsg3.put("content", "Call func");
        history2.add(userMsg3);

        Map<String, Object> assistantMsg3 = new HashMap<>();
        assistantMsg3.put("role", "assistant");
        assistantMsg3.put("content", null);
        assistantMsg3.put("tool_calls", List.of(Map.of("id", "call_456", "type", "function")));
        history2.add(assistantMsg3);

        Map<String, Object> toolMsg = new HashMap<>();
        toolMsg.put("role", "tool");
        toolMsg.put("tool_call_id", "call_456");
        toolMsg.put("content", "result");
        history2.add(toolMsg);
        
        repairMethod.invoke(chatService, history2);
        
        assertEquals(2, history2.size(), "Should remove everything until the last complete assistant text turn");
    }

    @Test
    void testTruncateHistory() throws Exception {
        java.lang.reflect.Method truncateMethod = ChatService.class.getDeclaredMethod("truncateHistory", List.class);
        truncateMethod.setAccessible(true);

        List<Map<String, Object>> history = new ArrayList<>();
        // Add 5 turns (10 messages)
        for (int i = 0; i < 5; i++) {
            Map<String, Object> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", "U" + i);
            history.add(userMsg);

            Map<String, Object> assistantMsg = new HashMap<>();
            assistantMsg.put("role", "assistant");
            assistantMsg.put("content", "M" + i);
            history.add(assistantMsg);
        }

        // Add a bad start (assistant message first)
        Map<String, Object> badStart = new HashMap<>();
        badStart.put("role", "assistant");
        badStart.put("content", "Bad start");
        history.add(0, badStart);
        
        truncateMethod.invoke(chatService, history);
        
        assertEquals("user", history.get(0).get("role"), "First message must be user");
    }
}
