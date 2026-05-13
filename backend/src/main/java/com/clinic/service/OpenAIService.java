package com.clinic.service;

import com.clinic.config.OpenAIConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Service gọi OpenAI API (GPT-5.3).
 * Thay thế GeminiService trước đó.
 * Hỗ trợ:
 * - Chat đơn giản (text prompt → text response)
 * - Function Calling / Tool Calls (AI gọi hàm Java để truy vấn DB)
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class OpenAIService {

    private final OpenAIConfig openAIConfig;
    @Qualifier("openaiWebClient")
    private final WebClient openaiWebClient;
    private final ObjectMapper objectMapper;

    /**
     * Gửi prompt đơn giản và nhận text response.
     */
    public String chat(String userMessage) {
        return chat(userMessage, null, null, null);
    }

    /**
     * Gửi prompt với system instruction, conversation history và function declarations.
     *
     * @param userMessage          Tin nhắn người dùng
     * @param systemInstruction    System prompt (vai trò AI)
     * @param conversationHistory  Lịch sử hội thoại (list of OpenAI message format)
     * @param functionDeclarations Danh sách functions AI có thể gọi (nullable)
     * @return Response text từ OpenAI, hoặc JSON tool call
     */
    public String chat(String userMessage, String systemInstruction,
            List<Map<String, Object>> conversationHistory,
            List<Map<String, Object>> functionDeclarations) {
        try {
            ObjectNode requestBody = buildRequestBody(
                    userMessage, systemInstruction, conversationHistory, functionDeclarations);

            log.debug("OpenAI request body: {}", requestBody.toString());

            String responseJson = openaiWebClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(openAIConfig.getTimeoutSeconds()))
                    .block();

            log.debug("OpenAI response: {}", responseJson);
            return extractResponse(responseJson);

        } catch (WebClientResponseException e) {
            log.error("OpenAI API error: {} - {} - Request payload preview: {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), userMessage);
            if (e.getStatusCode().value() == 400) {
                throw new RuntimeException("OpenAI 400 Error: " + e.getResponseBodyAsString());
            } else if (e.getStatusCode().value() == 401) {
                throw new RuntimeException("API Key không hợp lệ hoặc đã hết hạn.");
            } else if (e.getStatusCode().value() == 429) {
                throw new RuntimeException("Đã vượt quá giới hạn gọi API. Vui lòng thử lại sau.");
            } else if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("Model không tồn tại. Vui lòng kiểm tra lại cấu hình.");
            }
            throw new RuntimeException("Lỗi kết nối AI. Vui lòng thử lại sau.");
        } catch (Exception e) {
            log.error("Unexpected error calling OpenAI API", e);
            if (e.getMessage() != null && e.getMessage().contains("Timeout")) {
                throw new RuntimeException("AI phản hồi quá lâu. Vui lòng thử lại.");
            }
            throw new RuntimeException("Không thể kết nối đến AI. Vui lòng thử lại sau.");
        }
    }

    /**
     * Gửi tool result về cho OpenAI để nó soạn câu trả lời cuối cùng.
     */
    public String sendFunctionResult(String toolCallId, String functionName, String resultJson,
            String systemInstruction,
            List<Map<String, Object>> conversationHistory,
            List<Map<String, Object>> functionDeclarations) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", openAIConfig.getModel());

            // Messages
            ArrayNode messages = objectMapper.createArrayNode();

            // System message
            if (systemInstruction != null) {
                ObjectNode sysMsg = objectMapper.createObjectNode();
                sysMsg.put("role", "system");
                sysMsg.put("content", systemInstruction);
                messages.add(sysMsg);
            }

            // Conversation history
            if (conversationHistory != null) {
                for (Map<String, Object> msg : conversationHistory) {
                    messages.add(objectMapper.valueToTree(msg));
                }
            }

            // Tool result message
            ObjectNode toolMsg = objectMapper.createObjectNode();
            toolMsg.put("role", "tool");
            toolMsg.put("tool_call_id", toolCallId);
            toolMsg.put("content", resultJson);
            messages.add(toolMsg);

            requestBody.set("messages", messages);

            // Tools (function declarations)
            if (functionDeclarations != null && !functionDeclarations.isEmpty()) {
                requestBody.set("tools", buildTools(functionDeclarations));
            }

            // Generation config
            addGenerationConfig(requestBody);

            log.debug("OpenAI function result request body: {}", requestBody.toString());

            String responseJson = openaiWebClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(openAIConfig.getTimeoutSeconds()))
                    .block();

            log.debug("OpenAI function result response: {}", responseJson);
            return extractResponse(responseJson);

        } catch (WebClientResponseException e) {
            log.error("OpenAI API error in sendFunctionResult: {} - {} - Function: {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), functionName);
            throw new RuntimeException("Lỗi xử lý kết quả AI. Chi tiết: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error sending function result to OpenAI", e);
            throw new RuntimeException("Lỗi xử lý kết quả. Vui lòng thử lại.");
        }
    }

    /**
     * Kiểm tra xem response có phải là tool call không.
     */
    public boolean isFunctionCall(String response) {
        try {
            JsonNode node = objectMapper.readTree(response);
            return node.has("toolCall");
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Parse tool call từ response.
     *
     * @return Map với "name", "args", và "toolCallId"
     */
    public Map<String, Object> parseFunctionCall(String response) {
        try {
            JsonNode node = objectMapper.readTree(response);
            JsonNode toolCall = node.get("toolCall");
            String id = toolCall.get("id").asText();
            String name = toolCall.get("name").asText();
            JsonNode args = toolCall.get("args");
            Map<String, Object> argsMap = objectMapper.convertValue(args, Map.class);
            return Map.of("id", id, "name", name, "args", argsMap != null ? argsMap : Map.of());
        } catch (Exception e) {
            log.error("Error parsing tool call", e);
            throw new RuntimeException("Không thể phân tích yêu cầu AI");
        }
    }

    // ─── Private helpers ───────────────────────────────────

    private ObjectNode buildRequestBody(String userMessage, String systemInstruction,
            List<Map<String, Object>> conversationHistory,
            List<Map<String, Object>> functionDeclarations) {
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", openAIConfig.getModel());

        ArrayNode messages = objectMapper.createArrayNode();

        // System message
        if (systemInstruction != null) {
            ObjectNode sysMsg = objectMapper.createObjectNode();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemInstruction);
            messages.add(sysMsg);
        }

        // Conversation history
        if (conversationHistory != null) {
            for (Map<String, Object> msg : conversationHistory) {
                messages.add(objectMapper.valueToTree(msg));
            }
        }

        // Current user message
        ObjectNode userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);

        requestBody.set("messages", messages);

        // Tools (Function Calling)
        if (functionDeclarations != null && !functionDeclarations.isEmpty()) {
            requestBody.set("tools", buildTools(functionDeclarations));
        }

        // Generation config
        addGenerationConfig(requestBody);

        return requestBody;
    }

    /**
     * Chuyển đổi function declarations từ format cũ (Gemini) sang format OpenAI tools.
     * OpenAI format: [{ "type": "function", "function": { "name": ..., "description": ..., "parameters": ... } }]
     */
    private ArrayNode buildTools(List<Map<String, Object>> functionDeclarations) {
        ArrayNode tools = objectMapper.createArrayNode();
        for (Map<String, Object> func : functionDeclarations) {
            ObjectNode tool = objectMapper.createObjectNode();
            tool.put("type", "function");

            ObjectNode funcObj = objectMapper.createObjectNode();
            funcObj.put("name", (String) func.get("name"));
            funcObj.put("description", (String) func.get("description"));

            @SuppressWarnings("unchecked")
            Map<String, Object> params = (Map<String, Object>) func.get("parameters");
            if (params != null) {
                funcObj.set("parameters", objectMapper.valueToTree(params));
            } else {
                ObjectNode emptyParams = objectMapper.createObjectNode();
                emptyParams.put("type", "object");
                emptyParams.set("properties", objectMapper.createObjectNode());
                funcObj.set("parameters", emptyParams);
            }

            tool.set("function", funcObj);
            tools.add(tool);
        }
        return tools;
    }

    private void addGenerationConfig(ObjectNode requestBody) {
        requestBody.put("max_tokens", openAIConfig.getMaxTokens());
        requestBody.put("temperature", 0.3); // Low temperature for factual responses
    }

    /**
     * Extract text hoặc tool call từ OpenAI response JSON.
     * 
     * OpenAI response format:
     * {
     *   "choices": [{
     *     "message": {
     *       "role": "assistant",
     *       "content": "text" | null,
     *       "tool_calls": [{ "id": "...", "type": "function", "function": { "name": "...", "arguments": "{...}" } }]
     *     }
     *   }]
     * }
     *
     * Nếu là tool call → trả về JSON string {"toolCall": {...}}
     * Nếu là text → trả về text thuần
     */
    private String extractResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode choices = root.get("choices");

            if (choices == null || choices.isEmpty()) {
                log.warn("No choices in OpenAI response: {}", responseJson);
                return "Xin lỗi, em không thể trả lời câu hỏi này.";
            }

            JsonNode message = choices.get(0).get("message");
            if (message == null) {
                return "Xin lỗi, em không thể trả lời câu hỏi này.";
            }

            // Check if it's a tool call
            JsonNode toolCalls = message.get("tool_calls");
            if (toolCalls != null && !toolCalls.isEmpty()) {
                JsonNode firstToolCall = toolCalls.get(0);
                JsonNode function = firstToolCall.get("function");
                
                ObjectNode tcResult = objectMapper.createObjectNode();
                ObjectNode toolCallNode = objectMapper.createObjectNode();
                toolCallNode.put("id", firstToolCall.get("id").asText());
                toolCallNode.put("name", function.get("name").asText());
                
                // Parse arguments string to JSON object
                String argsStr = function.get("arguments").asText();
                toolCallNode.set("args", objectMapper.readTree(argsStr));
                
                tcResult.set("toolCall", toolCallNode);
                return tcResult.toString();
            }

            // Otherwise return text content
            JsonNode content = message.get("content");
            if (content != null && !content.isNull()) {
                return content.asText();
            }

            return "Xin lỗi, em không thể trả lời câu hỏi này.";

        } catch (Exception e) {
            log.error("Error parsing OpenAI response: {}", responseJson, e);
            return "Xin lỗi, có lỗi xảy ra khi xử lý phản hồi.";
        }
    }
}
