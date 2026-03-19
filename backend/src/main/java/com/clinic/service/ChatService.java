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
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ChatService {

    private final GeminiService geminiService;
    private final ChatFunctionService chatFunctionService;
    private final SecurityUtils securityUtils;
    private final ObjectMapper objectMapper;

    // Lưu lịch sử hội thoại tạm thời trong bộ nhớ (Key: User ID)
    private final Map<UUID, List<Map<String, Object>>> chatHistoryMap = new ConcurrentHashMap<>();

    private static final int MAX_HISTORY_SIZE = 20;

    /**
     * Xử lý tin nhắn chat từ người dùng.
     */
    public ChatResponse processChat(ChatRequest request) {
        UUID userId = securityUtils.getCurrentUserId().orElseThrow(() -> new RuntimeException("Người dùng chưa đăng nhập"));
        String userMsg = request.getMessage();

        // 1. Lấy lịch sử hội thoại
        List<Map<String, Object>> history = chatHistoryMap.computeIfAbsent(userId, k -> new ArrayList<>());

        // 2. Định nghĩa System Instruction
        String systemInstruction = "Bạn là trợ lý ảo chính thức của phòng khám Đa khoa ClinicPro. " +
                "Nhiệm vụ của bạn là hỗ trợ bệnh nhân giải đáp thắc mắc về chuyên khoa, bác sĩ, lịch làm việc, tra cứu thuốc và xem lịch hẹn cá nhân. " +
                "Hãy trả lời thân thiện, chuyên nghiệp, bằng tiếng Việt. " +
                "Quan trọng: Chỉ trả lời dựa trên dữ liệu thật từ các công cụ (functions) được cung cấp. Nếu không tìm thấy dữ liệu, hãy báo người dùng liên hệ hotline. " +
                "Nếu người dùng hỏi vấn đề không liên quan đến y tế hoặc phòng khám, hãy từ chối lịch sự.";

        // 3. Định nghĩa danh sách functions AI có thể gọi
        List<Map<String, Object>> functions = getFunctionDeclarations();

        try {
            // 4. Gọi Gemini lần đầu
            String response = geminiService.chat(userMsg, systemInstruction, history, functions);

            // 5. Vòng lặp xử lý Function Calling (nếu có)
            int loopCount = 0;
            if (geminiService.isFunctionCall(response)) {
                // Thêm tin nhắn user vào lịch sử ngay khi biết sẽ có Function Call
                history.add(Map.of("role", "user", "parts", List.of(Map.of("text", userMsg))));
            }

            while (geminiService.isFunctionCall(response) && loopCount < 5) {
                // Lưu message role: model (với functionCall) vào lịch sử
                Map<String, Object> assistantPart = Map.of(
                    "role", "model", 
                    "parts", List.of(objectMapper.readTree(response))
                );
                history.add(assistantPart);

                Map<String, Object> call = geminiService.parseFunctionCall(response);
                String functionName = (String) call.get("name");
                
                @SuppressWarnings("unchecked")
                Map<String, Object> args = (Map<String, Object>) call.get("args");

                log.info("Gemini requested function: {} with args: {}", functionName, args);

                // Thực thi hàm Java tương ứng
                Object result = executeFunction(functionName, args);
                String resultJson = objectMapper.writeValueAsString(result);

                // Gửi kết quả về cho Gemini (GeminiService sẽ thêm role: function vào contents)
                response = geminiService.sendFunctionResult(functionName, resultJson, systemInstruction, history, functions);
                
                // Lưu kết quả function vào lịch sử sau khi gọi xong để các lượt sau có dữ liệu
                Map<String, Object> functionPart = Map.of(
                    "role", "function",
                    "parts", List.of(Map.of(
                        "functionResponse", Map.of(
                            "name", functionName,
                            "response", Map.of("result", result)
                        )
                    ))
                );
                history.add(functionPart);

                loopCount++;
            }

            // 6. Cập nhật lịch sử hội thoại (lưu text response cuối cùng)
            updateHistory(userId, userMsg, response);

            return ChatResponse.of(response);

        } catch (Exception e) {
            log.error("Error in AI processing loop", e);
            return ChatResponse.error("Xin lỗi, hệ thống AI đang gặp sự cố. " + e.getMessage());
        }
    }

    private void updateHistory(UUID userId, String userMsg, String assistantMsg) {
        List<Map<String, Object>> history = chatHistoryMap.get(userId);
        
        // Add user msg
        Map<String, Object> userPart = Map.of("role", "user", "parts", List.of(Map.of("text", userMsg)));
        history.add(userPart);

        // Add assistant msg
        Map<String, Object> assistantPart = Map.of("role", "model", "parts", List.of(Map.of("text", assistantMsg)));
        history.add(assistantPart);

        // Giới hạn số lượng tin nhắn trong lịch sử
        if (history.size() > MAX_HISTORY_SIZE) {
            // Remove 2 oldest (1 pair)
            history.remove(0);
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
     * Định nghĩa Metadata cho các Function để gửi cho Gemini.
     */
    private List<Map<String, Object>> getFunctionDeclarations() {
        List<Map<String, Object>> declarations = new ArrayList<>();

        // 1. listSpecialties
        declarations.add(createFunc("listSpecialties", "Liệt kê danh sách các chuyên khoa của phòng khám.", null));

        // 2. searchDoctors
        Map<String, Object> searchDoctorsParams = new HashMap<>();
        searchDoctorsParams.put("type", "object");
        Map<String, Object> searchDoctorsProps = new HashMap<>();
        searchDoctorsProps.put("specialtyName", Map.of("type", "string", "description", "Tên chuyên khoa (ví dụ: Tim mạch, Nhi khoa)"));
        searchDoctorsProps.put("doctorName", Map.of("type", "string", "description", "Tên bác sĩ cần tìm"));
        searchDoctorsParams.put("properties", searchDoctorsProps);
        declarations.add(createFunc("searchDoctors", "Tìm kiếm bác sĩ theo chuyên khoa hoặc tên.", searchDoctorsParams));

        // 3. getDoctorSchedule
        Map<String, Object> scheduleParams = new HashMap<>();
        scheduleParams.put("type", "object");
        Map<String, Object> scheduleProps = new HashMap<>();
        scheduleProps.put("doctorId", Map.of("type", "string", "description", "ID của bác sĩ (UUID)"));
        scheduleProps.put("date", Map.of("type", "string", "description", "Ngày cần xem lịch (định dạng YYYY-MM-DD), mặc định là ngày hiện tại"));
        scheduleParams.put("properties", scheduleProps);
        scheduleParams.put("required", List.of("doctorId"));
        declarations.add(createFunc("getDoctorSchedule", "Xem lịch làm việc và khung giờ còn trống của bác sĩ.", scheduleParams));

        // 4. searchMedicines
        Map<String, Object> medicineParams = new HashMap<>();
        medicineParams.put("type", "object");
        medicineParams.put("properties", Map.of("name", Map.of("type", "string", "description", "Tên thuốc cần tìm")));
        medicineParams.put("required", List.of("name"));
        declarations.add(createFunc("searchMedicines", "Tra cứu thông tin và giá của các loại thuốc tại phòng khám.", medicineParams));

        // 5. getMyAppointments
        declarations.add(createFunc("getMyAppointments", "Xem danh sách lịch hẹn của chính người dùng đang đăng nhập.", null));

        // 6. getClinicInfo
        declarations.add(createFunc("getClinicInfo", "Lấy thông tin chung của phòng khám (địa chỉ, số điện thoại, giờ làm việc).", null));

        return declarations;
    }

    private Map<String, Object> createFunc(String name, String description, Map<String, Object> parameters) {
        Map<String, Object> func = new HashMap<>();
        func.put("name", name);
        func.put("description", description);
        if (parameters != null) {
            func.put("parameters", parameters);
        }
        return func;
    }
}
