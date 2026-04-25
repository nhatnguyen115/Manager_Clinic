package com.clinic.service;

import com.clinic.entity.*;
import com.clinic.repository.*;
import com.clinic.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Cung cấp các hàm truy vấn dữ liệu cho AI Chatbot.
 * Chuyển đổi dữ liệu từ Entity sang Map/DTO đơn giản cho Gemini dễ hiểu.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ChatFunctionService {

    private final SpecialtyRepository specialtyRepository;
    private final DoctorRepository doctorRepository;
    private final WorkingScheduleRepository workingScheduleRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final MedicineRepository medicineRepository;
    private final AppointmentRepository appointmentRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listSpecialties() {
        log.info("AI calling listSpecialties");
        return specialtyRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId().toString());
                    map.put("name", s.getName());
                    map.put("description", s.getDescription());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchDoctors(String specialtyName, String doctorName) {
        log.info("AI calling searchDoctors: spec={}, name={}", specialtyName, doctorName);
        
        // Logic search kết hợp
        List<Doctor> doctors;
        if (specialtyName != null && !specialtyName.isEmpty()) {
            Optional<Specialty> specialty = specialtyRepository.findByName(specialtyName);
            if (specialty.isPresent()) {
                doctors = doctorRepository.findBySpecialty_IdAndIsAvailableTrue(
                        specialty.get().getId(), PageRequest.of(0, 10)).getContent();
            } else {
                doctors = Collections.emptyList();
            }
        } else if (doctorName != null && !doctorName.isEmpty()) {
            doctors = doctorRepository.searchByName(doctorName, PageRequest.of(0, 10)).getContent();
        } else {
            doctors = doctorRepository.findByIsAvailableTrue(PageRequest.of(0, 10)).getContent();
        }

        return doctors.stream()
                .map(d -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", d.getId().toString());
                    map.put("fullName", d.getUser().getFullName());
                    map.put("specialty", d.getSpecialty() != null ? d.getSpecialty().getName() : "N/A");
                    map.put("consultationFee", String.format("%,.0f VNĐ", d.getConsultationFee()));
                    map.put("bio", d.getBio());
                    map.put("avgRating", d.getAvgRating());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDoctorSchedule(String doctorId, String dateStr) {
        log.info("AI calling getDoctorSchedule: id={}, date={}", doctorId, dateStr);
        try {
            UUID docId = UUID.fromString(doctorId);
            LocalDate date = (dateStr != null && !dateStr.isEmpty()) 
                    ? LocalDate.parse(dateStr) 
                    : LocalDate.now();

            List<WorkingSchedule> schedules = workingScheduleRepository.findByDoctorAndDate(
                    docId, date, date.getDayOfWeek().getValue());

            List<Map<String, Object>> result = new ArrayList<>();
            for (WorkingSchedule ws : schedules) {
                List<TimeSlot> slots = timeSlotRepository.findByScheduleIdAndIsAvailableTrue(ws.getId());
                for (TimeSlot ts : slots) {
                    Map<String, Object> slotMap = new HashMap<>();
                    slotMap.put("time", ts.getStartTime().toString() + " - " + ts.getEndTime().toString());
                    slotMap.put("id", ts.getId());
                    result.add(slotMap);
                }
            }
            return result;
        } catch (Exception e) {
            log.error("Error fetching doctor schedule", e);
            return Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchMedicines(String name) {
        log.info("AI calling searchMedicines: name={}", name);
        if (name == null || name.isEmpty()) return Collections.emptyList();

        return medicineRepository.searchByName(name, PageRequest.of(0, 5)).getContent().stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", m.getName());
                    map.put("genericName", m.getGenericName());
                    map.put("description", m.getDescription());
                    map.put("sideEffects", m.getSideEffects());
                    map.put("contraindications", m.getContraindications());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyAppointments() {
        log.info("AI calling getMyAppointments");
        Optional<UUID> userId = securityUtils.getCurrentUserId();
        if (userId.isEmpty()) return Collections.emptyList();

        List<Appointment> appointments = appointmentRepository.findAllByUserId(userId.get());
        return appointments.stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", a.getId().toString());
                    map.put("date", a.getAppointmentDate().toString());
                    map.put("time", a.getAppointmentTime().toString());
                    map.put("doctor", a.getDoctor().getUser().getFullName());
                    map.put("specialty", a.getSpecialty() != null ? a.getSpecialty().getName() : "N/A");
                    map.put("status", a.getStatus().name());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getClinicInfo() {
        log.info("AI calling getClinicInfo");
        Map<String, Object> info = new HashMap<>();
        info.put("clinicName", "Phòng khám Đa khoa ClinicPro");
        info.put("address", "123 Đường Láng, Đống Đa, Hà Nội");
        info.put("phone", "0123-456-789");
        info.put("workingHours", "Thứ 2 - Thứ 7: 7:30 - 20:30, Chủ nhật: 8:00 - 17:00");
        info.put("description", "ClinicPro là hệ thống y tế hiện đại với đội ngũ bác sĩ giàu kinh nghiệm, cung cấp dịch vụ khám chữa bệnh chất lượng cao.");
        return info;
    }
}
