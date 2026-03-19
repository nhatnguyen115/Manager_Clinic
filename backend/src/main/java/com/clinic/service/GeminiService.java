package com.clinic.service;

import com.clinic.config.GeminiConfig;
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
 * Service gọi Google Gemini API.
 * Hỗ trợ:
 * - Chat đơn giản (text prompt → text response)
 * - Function Calling (AI gọi hàm Java để truy vấn DB)
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiService {

    private final GeminiConfig geminiConfig;
    @Qualifier("geminiWebClient")
    private final WebClient geminiWebClient;
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
     * @param userMessage      Tin nhắn người dùng
     * @param systemInstruction System prompt (vai trò AI)
     * @param conversationHistory Lịch sử hội thoại (list of {role, parts})
     * @param functionDeclarations Danh sách functions AI có thể gọi (nullable)
     * @return Response text từ Gemini, hoặc JSON function call
     */
    public String chat(String userMessage, String systemInstruction,
                       List<Map<String, Object>> conversationHistory,
                       List<Map<String, Object>> functionDeclarations) {
        try {
            ObjectNode requestBody = buildRequestBody(
                    userMessage, systemInstruction, conversationHistory, functionDeclarations);

            String url = "/models/" + geminiConfig.getModel() + ":generateContent?key=" + geminiConfig.getApiKey();

            String responseJson = geminiWebClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(geminiConfig.getTimeoutSeconds()))
                    .block();

            return extractResponse(responseJson);

        } catch (WebClientResponseException e) {
            log.error("Gemini API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 400) {
                throw new RuntimeException("Yêu cầu không hợp lệ. Vui lòng thử lại.");
            } else if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
                throw new RuntimeException("API Key không hợp lệ hoặc đã hết hạn.");
            } else if (e.getStatusCode().value() == 429) {
                throw new RuntimeException("Đã vượt quá giới hạn gọi API. Vui lòng thử lại sau.");
            }
            throw new RuntimeException("Lỗi kết nối AI. Vui lòng thử lại sau.");
        } catch (Exception e) {
            log.error("Unexpected error calling Gemini API", e);
            if (e.getMessage() != null && e.getMessage().contains("Timeout")) {
                throw new RuntimeException("AI phản hồi quá lâu. Vui lòng thử lại.");
            }
            throw new RuntimeException("Không thể kết nối đến AI. Vui lòng thử lại sau.");
        }
    }

    /**
     * Gửi function result về cho Gemini để nó soạn câu trả lời cuối cùng.
     */
    public String sendFunctionResult(String functionName, String resultJson,
                                     String systemInstruction,
                                     List<Map<String, Object>> conversationHistory,
                                     List<Map<String, Object>> functionDeclarations) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();

            // System instruction
            if (systemInstruction != null) {
                ObjectNode sysNode = objectMapper.createObjectNode();
                ObjectNode sysPart = objectMapper.createObjectNode();
                sysPart.put("text", systemInstruction);
                sysNode.set("parts", objectMapper.createArrayNode().add(sysPart));
                requestBody.set("system_instruction", sysNode);
            }

            // Contents: conversation history + function response
            ArrayNode contents = objectMapper.createArrayNode();
            if (conversationHistory != null) {
                for (Map<String, Object> msg : conversationHistory) {
                    contents.add(objectMapper.valueToTree(msg));
                }
            }

            // Add function response
            ObjectNode functionResponseContent = objectMapper.createObjectNode();
            functionResponseContent.put("role", "function");
            ObjectNode functionPart = objectMapper.createObjectNode();
            ObjectNode functionResponse = objectMapper.createObjectNode();
            functionResponse.put("name", functionName);
            ObjectNode responseObj = objectMapper.createObjectNode();
            responseObj.set("result", objectMapper.readTree(resultJson));
            functionResponse.set("response", responseObj);
            functionPart.set("functionResponse", functionResponse);
            functionResponseContent.set("parts", objectMapper.createArrayNode().add(functionPart));
            contents.add(functionResponseContent);

            requestBody.set("contents", contents);

            // Tools (function declarations)
            if (functionDeclarations != null && !functionDeclarations.isEmpty()) {
                ArrayNode tools = objectMapper.createArrayNode();
                ObjectNode toolObj = objectMapper.createObjectNode();
                toolObj.set("function_declarations", objectMapper.valueToTree(functionDeclarations));
                tools.add(toolObj);
                requestBody.set("tools", tools);
            }

            // Generation config
            addGenerationConfig(requestBody);
            
            String url = "/models/" + geminiConfig.getModel() + ":generateContent?key=" + geminiConfig.getApiKey();

            String responseJson = geminiWebClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(geminiConfig.getTimeoutSeconds()))
                    .block();

            return extractResponse(responseJson);

        } catch (WebClientResponseException e) {
            log.error("Gemini API error in sendFunctionResult: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Lỗi xử lý kết quả AI. Chi tiết: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error sending function result to Gemini", e);
            throw new RuntimeException("Lỗi xử lý kết quả. Vui lòng thử lại.");
        }
    }

    /**
     * Kiểm tra xem response có phải là function call không.
     */
    public boolean isFunctionCall(String response) {
        try {
            JsonNode node = objectMapper.readTree(response);
            return node.has("functionCall");
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Parse function call từ response.
     * @return Map với "name" và "args"
     */
    public Map<String, Object> parseFunctionCall(String response) {
        try {
            JsonNode node = objectMapper.readTree(response);
            JsonNode functionCall = node.get("functionCall");
            String name = functionCall.get("name").asText();
            JsonNode args = functionCall.get("args");
            Map<String, Object> argsMap = objectMapper.convertValue(args, Map.class);
            return Map.of("name", name, "args", argsMap != null ? argsMap : Map.of());
        } catch (Exception e) {
            log.error("Error parsing function call", e);
            throw new RuntimeException("Không thể phân tích yêu cầu AI");
        }
    }

    // ─── Private helpers ───────────────────────────────────

    private ObjectNode buildRequestBody(String userMessage, String systemInstruction,
                                         List<Map<String, Object>> conversationHistory,
                                         List<Map<String, Object>> functionDeclarations) {
        ObjectNode requestBody = objectMapper.createObjectNode();

        // System instruction
        if (systemInstruction != null) {
            ObjectNode sysNode = objectMapper.createObjectNode();
            ObjectNode sysPart = objectMapper.createObjectNode();
            sysPart.put("text", systemInstruction);
            sysNode.set("parts", objectMapper.createArrayNode().add(sysPart));
            requestBody.set("system_instruction", sysNode);
        }

        // Contents
        ArrayNode contents = objectMapper.createArrayNode();

        // Add conversation history
        if (conversationHistory != null) {
            for (Map<String, Object> msg : conversationHistory) {
                contents.add(objectMapper.valueToTree(msg));
            }
        }

        // Add current user message
        ObjectNode userContent = objectMapper.createObjectNode();
        userContent.put("role", "user");
        ObjectNode userPart = objectMapper.createObjectNode();
        userPart.put("text", userMessage);
        userContent.set("parts", objectMapper.createArrayNode().add(userPart));
        contents.add(userContent);

        requestBody.set("contents", contents);

        // Tools (Function Calling)
        if (functionDeclarations != null && !functionDeclarations.isEmpty()) {
            ArrayNode tools = objectMapper.createArrayNode();
            ObjectNode toolObj = objectMapper.createObjectNode();
            toolObj.set("function_declarations", objectMapper.valueToTree(functionDeclarations));
            tools.add(toolObj);
            requestBody.set("tools", tools);
        }

        // Generation config
        addGenerationConfig(requestBody);

        return requestBody;
    }

    private void addGenerationConfig(ObjectNode requestBody) {
        ObjectNode genConfig = objectMapper.createObjectNode();
        genConfig.put("maxOutputTokens", geminiConfig.getMaxTokens());
        genConfig.put("temperature", 0.3); // Low temperature for factual responses
        requestBody.set("generationConfig", genConfig);
    }

    /**
     * Extract text hoặc function call từ Gemini response JSON.
     * Nếu là function call → trả về JSON string {"functionCall": {...}}
     * Nếu là text → trả về text thuần
     */
    private String extractResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.get("candidates");

            if (candidates == null || candidates.isEmpty()) {
                log.warn("No candidates in Gemini response: {}", responseJson);
                return "Xin lỗi, em không thể trả lời câu hỏi này.";
            }

            JsonNode content = candidates.get(0).get("content");
            if (content == null) {
                return "Xin lỗi, em không thể trả lời câu hỏi này.";
            }

            JsonNode parts = content.get("parts");
            if (parts == null || parts.isEmpty()) {
                return "Xin lỗi, em không thể trả lời câu hỏi này.";
            }

            JsonNode firstPart = parts.get(0);

            // Check if it's a function call
            if (firstPart.has("functionCall")) {
                ObjectNode fcResult = objectMapper.createObjectNode();
                fcResult.set("functionCall", firstPart.get("functionCall"));
                return fcResult.toString();
            }

            // Otherwise return text
            if (firstPart.has("text")) {
                return firstPart.get("text").asText();
            }

            return "Xin lỗi, em không thể trả lời câu hỏi này.";

        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", responseJson, e);
            return "Xin lỗi, có lỗi xảy ra khi xử lý phản hồi.";
        }
    }
}
