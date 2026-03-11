package com.clinic.scheduler;

import com.clinic.entity.Appointment;
import com.clinic.entity.enums.AppointmentStatus;
import com.clinic.repository.AppointmentRepository;
import com.clinic.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    /**
     * Runs every day at 8:00 AM to send reminders for appointments tomorrow.
     * Cron pattern: second minute hour day month day-of-week
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        log.info("Starting daily reminder job for date: {}", tomorrow);

        List<Appointment> appointments = appointmentRepository.findByAppointmentDateAndStatus(
                tomorrow, AppointmentStatus.CONFIRMED);

        log.info("Found {} confirmed appointments for tomorrow", appointments.size());

        for (Appointment appointment : appointments) {
            try {
                Map<String, Object> variables = new HashMap<>();
                variables.put("name", appointment.getPatient().getUser().getFullName());
                variables.put("doctorName", appointment.getDoctor().getUser().getFullName());
                variables.put("appointmentDate", appointment.getAppointmentDate().toString());
                variables.put("appointmentTime", appointment.getAppointmentTime().toString());

                emailService.sendHtmlEmail(
                        appointment.getPatient().getUser().getEmail(),
                        "Nhắc lịch hẹn khám ngày mai - ClinicPro",
                        "appointment-reminder",
                        variables);
            } catch (Exception e) {
                log.error("Failed to send reminder for appointment {}", appointment.getId(), e);
            }
        }

        log.info("Daily reminder job completed");
    }
}
