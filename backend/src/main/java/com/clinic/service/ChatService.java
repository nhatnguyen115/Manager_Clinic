package com.clinic.service;

import com.clinic.dto.request.ChatRequest;
import com.clinic.dto.response.ChatResponse;
import com.clinic.util.SecurityUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Điều phối chính cho AI Chatbot.
 * Quản lý hội thoại, System Prompt và thực thi Function Calling.
 * Sử dụng OpenAI GPT-5.3 (thay thế Gemini trước đó).
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ChatService {

    private final OpenAIService openAIService;
    private final ChatFunctionService chatFunctionService;
    private final SecurityUtils securityUtils;
    private final ObjectMapper objectMapper;

    // Lưu lịch sử hội thoại tạm thời trong bộ nhớ (Key: User ID)
    // Format OpenAI: [{ "role": "user"/"assistant"/"tool", "content": "..." }]
    private final Map<UUID, List<Map<String, Object>>> chatHistoryMap = new ConcurrentHashMap<>();

    private static final int MAX_HISTORY_SIZE = 20;

    /**
     * Xử lý tin nhắn chat từ người dùng.
     */
    public ChatResponse processChat(ChatRequest request) {
        UUID userId = securityUtils.getCurrentUserId()
                .orElseThrow(() -> new RuntimeException("Người dùng chưa đăng nhập"));
        String userMsg = request.getMessage();

        // 1. Lấy lịch sử hội thoại (làm việc trên bản sao để tránh "nhiễm độc" khi lỗi)
        List<Map<String, Object>> originalHistory = chatHistoryMap.getOrDefault(userId, new ArrayList<>());
        List<Map<String, Object>> history = new ArrayList<>(originalHistory);

        // Đảm bảo lịch sử ở trạng thái hợp lệ
        repairHistory(history);

        // 2. Định nghĩa System Instruction
        String specialtiesInfo = "- Tim mạch, Nhi khoa, Da liễu, Nội khoa, Thần kinh, Cơ xương khớp, Tai mũi họng, Răng hàm mặt, Sản phụ khoa, Mắt.";
        String clinicInfoHtml = "Tên: Phòng khám Đa khoa ClinicPro. Địa chỉ: 123 Đường Láng, Đống Đa, Hà Nội. Hotline: 0123-456-789. Giờ làm việc: Thứ 2 - Thứ 7 (7:30 - 20:30), Chủ nhật (8:00 - 17:00).";

        String systemInstruction = "Bạn là trợ lý ảo chính thức của phòng khám Đa khoa ClinicPro. " +
                "Nhiệm vụ của bạn là hỗ trợ bệnh nhân giải đáp thắc mắc về chuyên khoa, bác sĩ, lịch làm việc, tra cứu thuốc và xem lịch hẹn cá nhân. "
                +
                "Hãy trả lời thân thiện, chuyên nghiệp, bằng tiếng Việt. " +
                "\n\nTHÔNG TIN PHÒNG KHÁM:\n" + clinicInfoHtml +
                "\n\nDANH SÁCH CHUYÊN KHOA:\n" + specialtiesInfo +
                "\n\nQuan trọng: Chỉ trả lời dữ liệu về Chuyên khoa và Thông tin chung dựa trên thông tin trên. " +
                "Chỉ gọi hàm (functions) khi cần tìm Bác sĩ cụ thể, xem Lịch làm việc, Tra cứu thuốc hoặc Lịch hẹn cá nhân. "
                +
                "Nếu không tìm thấy dữ liệu, hãy báo người dùng liên hệ hotline. " +
                "Nếu người dùng hỏi vấn đề không liên quan đến y tế hoặc phòng khám, hãy từ chối lịch sự.";

        // 3. Định nghĩa danh sách functions AI có thể gọi
        List<Map<String, Object>> functions = getFunctionDeclarations();

        try {
            log.debug("Current history size for {}: {}", userId, history.size());

            // 4. Gọi OpenAI lần đầu
            String response = openAIService.chat(userMsg, systemInstruction, history, functions);

            boolean hadFunctionCall = openAIService.isFunctionCall(response);

            // 5. Vòng lặp xử lý Tool Calling (nếu có)
            int loopCount = 0;
            if (hadFunctionCall) {
                // Thêm tin nhắn user vào lịch sử ngay khi biết sẽ có Tool Call
                Map<String, Object> userEntry = new HashMap<>();
                userEntry.put("role", "user");
                userEntry.put("content", userMsg);
                history.add(userEntry);
            }

            while (openAIService.isFunctionCall(response) && loopCount < 5) {
                Map<String, Object> call = openAIService.parseFunctionCall(response);
                String toolCallId = (String) call.get("id");
                String functionName = (String) call.get("name");

                @SuppressWarnings("unchecked")
                Map<String, Object> args = (Map<String, Object>) call.get("args");

                log.info("OpenAI requested function: {} with args: {}", functionName, args);

                // Lưu assistant message (tool_calls) vào lịch sử
                Map<String, Object> assistantEntry = new HashMap<>();
                assistantEntry.put("role", "assistant");
                assistantEntry.put("content", null); // content null khi có tool_calls

                // Build tool_calls array cho assistant message
                List<Map<String, Object>> toolCallsList = new ArrayList<>();
                Map<String, Object> toolCallEntry = new HashMap<>();
                toolCallEntry.put("id", toolCallId);
                toolCallEntry.put("type", "function");
                Map<String, Object> functionEntry = new HashMap<>();
                functionEntry.put("name", functionName);
                functionEntry.put("arguments", objectMapper.writeValueAsString(args));
                toolCallEntry.put("function", functionEntry);
                toolCallsList.add(toolCallEntry);
                assistantEntry.put("tool_calls", toolCallsList);
                history.add(assistantEntry);

                // Thực thi hàm Java tương ứng
                Object result = executeFunction(functionName, args);
                String resultJson = objectMapper.writeValueAsString(result);

                // Lưu tool result vào lịch sử
                Map<String, Object> toolResultEntry = new HashMap<>();
                toolResultEntry.put("role", "tool");
                toolResultEntry.put("tool_call_id", toolCallId);
                toolResultEntry.put("content", resultJson);
                history.add(toolResultEntry);

                // Gửi kết quả về cho OpenAI
                response = openAIService.sendFunctionResult(
                        toolCallId, functionName, resultJson, systemInstruction, history, functions);

                loopCount++;
            }

            // 6. Cập nhật lịch sử hội thoại (lưu text response cuối cùng)
            if (!hadFunctionCall) {
                Map<String, Object> userEntry = new HashMap<>();
                userEntry.put("role", "user");
                userEntry.put("content", userMsg);
                history.add(userEntry);
            }
            Map<String, Object> assistantEntry = new HashMap<>();
            assistantEntry.put("role", "assistant");
            assistantEntry.put("content", response);
            history.add(assistantEntry);

            // Giới hạn số lượng tin nhắn trong lịch sử
            truncateHistory(history);

            // 7. Lưu lại lịch sử đã cập nhật thành công
            chatHistoryMap.put(userId, history);

            return ChatResponse.of(response);

        } catch (Exception e) {
            log.error("Error in AI processing loop for user {}", userId, e);
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Hệ thống AI đang gặp sự cố. Vui lòng thử lại.";
            return ChatResponse.error("Xin lỗi, " + errorMsg);
        }
    }

    /**
     * Repair history để đảm bảo trạng thái hợp lệ cho OpenAI.
     * OpenAI yêu cầu: user → assistant → tool (nếu có) → assistant ...
     * Lịch sử hợp lệ PHẢI kết thúc bằng assistant message có content (text).
     */
    private void repairHistory(List<Map<String, Object>> history) {
        if (history.isEmpty())
            return;

        while (!history.isEmpty()) {
            Map<String, Object> last = history.get(history.size() - 1);
            String role = (String) last.get("role");

            if ("assistant".equals(role)) {
                // Kiểm tra assistant có content text không (không phải tool_calls)
                Object content = last.get("content");
                if (content != null && content instanceof String && !((String) content).isEmpty()) {
                    // Kết thúc bằng assistant text → Hợp lệ
                    break;
                } else {
                    // Kết thúc bằng assistant tool_calls → Không hợp lệ
                    log.warn("Removing incomplete assistant tool_calls from history");
                    history.remove(history.size() - 1);
                }
            } else if ("tool".equals(role)) {
                // Kết thúc bằng tool response nhưng chưa có assistant text → Không hợp lệ
                log.warn("Removing orphaned tool response from history");
                history.remove(history.size() - 1);
            } else if ("user".equals(role)) {
                // Kết thúc bằng user nhưng chưa có assistant response → Không hợp lệ
                log.warn("Removing orphaned user message from history");
                history.remove(history.size() - 1);
            } else {
                break;
            }
        }
    }

    private void truncateHistory(List<Map<String, Object>> history) {
        while (history.size() > MAX_HISTORY_SIZE) {
            history.remove(0);
        }
        // Đảm bảo tin nhắn đầu tiên phải là "user"
        while (!history.isEmpty() && !"user".equals(history.get(0).get("role"))) {
            history.remove(0);
        }
    }

    /**
     * Thực thi hàm Java dựa trên tên hàm AI yêu cầu.
     */
    private Object executeFunction(String name, Map<String, Object> args) {
        return switch (name) {
            case "listSpecialties" -> chatFunctionService.listSpecialties();
            case "searchDoctors" -> chatFunctionService.searchDoctors(
                    (String) args.get("specialtyName"),
                    (String) args.get("doctorName"));
            case "getDoctorSchedule" -> chatFunctionService.getDoctorSchedule(
                    (String) args.get("doctorId"),
                    (String) args.get("date"));
            case "searchMedicines" -> chatFunctionService.searchMedicines((String) args.get("name"));
            case "getMyAppointments" -> chatFunctionService.getMyAppointments();
            case "getClinicInfo" -> chatFunctionService.getClinicInfo();
            default -> Map.of("error", "Function not found");
        };
    }

    /**
     * Định nghĩa Metadata cho các Function để gửi cho OpenAI.
     * Format tương thích cả Gemini và OpenAI (OpenAIService sẽ wrap thêm "type":
     * "function").
     */
    private List<Map<String, Object>> getFunctionDeclarations() {
        List<Map<String, Object>> declarations = new ArrayList<>();

        // 1. searchDoctors
        Map<String, Object> searchDoctorsParams = new HashMap<>();
        searchDoctorsParams.put("type", "object");
        Map<String, Object> searchDoctorsProps = new HashMap<>();
        searchDoctorsProps.put("specialtyName",
                Map.of("type", "string", "description", "Tên chuyên khoa (ví dụ: Tim mạch, Nhi khoa)"));
        searchDoctorsProps.put("doctorName", Map.of("type", "string", "description", "Tên bác sĩ cần tìm"));
        searchDoctorsParams.put("properties", searchDoctorsProps);
        declarations
                .add(createFunc("searchDoctors", "Tìm kiếm bác sĩ theo chuyên khoa hoặc tên.", searchDoctorsParams));

        // 2. getDoctorSchedule
        Map<String, Object> scheduleParams = new HashMap<>();
        scheduleParams.put("type", "object");
        Map<String, Object> scheduleProps = new HashMap<>();
        scheduleProps.put("doctorId", Map.of("type", "string", "description", "ID của bác sĩ (UUID)"));
        scheduleProps.put("date", Map.of("type", "string", "description",
                "Ngày cần xem lịch (định dạng YYYY-MM-DD), mặc định là ngày hiện tại"));
        scheduleParams.put("properties", scheduleProps);
        scheduleParams.put("required", List.of("doctorId"));
        declarations.add(createFunc("getDoctorSchedule", "Xem lịch làm việc và khung giờ còn trống của bác sĩ.",
                scheduleParams));

        // 3. searchMedicines
        Map<String, Object> medicineParams = new HashMap<>();
        medicineParams.put("type", "object");
        medicineParams.put("properties", Map.of("name", Map.of("type", "string", "description", "Tên thuốc cần tìm")));
        medicineParams.put("required", List.of("name"));
        declarations.add(createFunc("searchMedicines", "Tra cứu thông tin và giá của các loại thuốc tại phòng khám.",
                medicineParams));

        // 4. getMyAppointments
        declarations.add(
                createFunc("getMyAppointments", "Xem danh sách lịch hẹn của chính người dùng đang đăng nhập.", null));

        return declarations;
    }

    private Map<String, Object> createFunc(String name, String description, Map<String, Object> parameters) {
        Map<String, Object> func = new HashMap<>();
        func.put("name", name);
        func.put("description", description);

        if (parameters == null) {
            parameters = new HashMap<>();
            parameters.put("type", "object");
            parameters.put("properties", new HashMap<>());
        }

        func.put("parameters", parameters);
        return func;
    }
}
