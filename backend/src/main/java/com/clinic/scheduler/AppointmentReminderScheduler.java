package com.clinic.scheduler;

import com.clinic.entity.Appointment;
import com.clinic.entity.enums.AppointmentStatus;
import com.clinic.entity.enums.NotificationType;
import com.clinic.repository.AppointmentRepository;
import com.clinic.service.EmailService;
import com.clinic.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    /**
     * Runs every day at 8:00 AM to send reminders for appointments tomorrow
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendAppointmentReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        log.info("Running appointment reminder job for date: {}", tomorrow);

        List<Appointment> appointments = appointmentRepository.findByAppointmentDateAndStatus(
                tomorrow, AppointmentStatus.CONFIRMED);

        log.info("Found {} confirmed appointments for tomorrow", appointments.size());

        for (Appointment appointment : appointments) {
            try {
                // 1. Send In-app Notification
                String title = "Nhắc hẹn khám ngày mai";
                String message = String.format("Bạn có lịch hẹn với bác sĩ %s vào lúc %s ngày mai.",
                        appointment.getDoctor().getUser().getFullName(),
                        appointment.getAppointmentTime());

                notificationService.sendNotification(
                        appointment.getPatient().getUser(),
                        title,
                        message,
                        NotificationType.REMINDER,
                        "APPOINTMENT",
                        appointment.getId());

                // 2. Send Email
                Map<String, Object> emailVars = new HashMap<>();
                emailVars.put("patientName", appointment.getPatient().getUser().getFullName());
                emailVars.put("doctorName", appointment.getDoctor().getUser().getFullName());
                emailVars.put("time", appointment.getAppointmentTime());
                emailVars.put("date", tomorrow.toString());
                emailVars.put("appointmentLink", "http://localhost:5173/appointments/" + appointment.getId());

                emailService.sendHtmlEmail(
                        appointment.getPatient().getUser().getEmail(),
                        "Nhắc lịch hẹn khám tại ClinicPro - " + tomorrow,
                        "appointment-reminder",
                        emailVars);

            } catch (Exception e) {
                log.error("Error sending reminder for appointment ID: {}", appointment.getId(), e);
            }
        }
    }

    /**
     * Runs every minute to send alerts for appointments starting in exactly 30
     * minutes
     */
    @Scheduled(cron = "0 * * * * *")
    public void sendUpcomingAppointmentAlerts() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        LocalTime targetTimeStart = now.plusMinutes(10).withSecond(0).withNano(0);
        LocalTime targetTimeEnd = targetTimeStart.plusMinutes(1);

        // DEBUG: Log thoi gian de kiem tra
        log.info("[REMINDER-DEBUG] Now={}, Looking for appointments between {} and {} on {}",
                now, targetTimeStart, targetTimeEnd, today);

        List<Appointment> appointments = appointmentRepository.findByAppointmentDateAndStatusAndAppointmentTimeBetween(
                today, AppointmentStatus.CONFIRMED, targetTimeStart, targetTimeEnd);

        log.info("[REMINDER-DEBUG] Found {} appointments in target window", appointments.size());

        // Kiem tra tat ca lich hom nay de so sanh
        List<Appointment> allTodayConfirmed = appointmentRepository.findByAppointmentDateAndStatus(
                today, AppointmentStatus.CONFIRMED);
        log.info("[REMINDER-DEBUG] Total CONFIRMED appointments today: {}", allTodayConfirmed.size());
        allTodayConfirmed.forEach(a -> log.info("[REMINDER-DEBUG]   - Appointment at {} (ID: {})",
                a.getAppointmentTime(), a.getId()));

        if (!appointments.isEmpty()) {
            log.info("Found {} appointments starting in 30 minutes", appointments.size());
            for (Appointment appointment : appointments) {
                try {
                    String title = "Sắp đến giờ khám bệnh";
                    String message = String.format(
                            "Bạn có lịch khám với bác sĩ %s vào lúc %s (sắp tới). Vui lòng chuẩn bị đến phòng khám.",
                            appointment.getDoctor().getUser().getFullName(),
                            appointment.getAppointmentTime());

                    notificationService.sendNotification(
                            appointment.getPatient().getUser(),
                            title,
                            message,
                            NotificationType.REMINDER,
                            "APPOINTMENT",
                            appointment.getId());

                    Map<String, Object> emailVars = new HashMap<>();
                    emailVars.put("patientName", appointment.getPatient().getUser().getFullName());
                    emailVars.put("doctorName", appointment.getDoctor().getUser().getFullName());
                    emailVars.put("time", appointment.getAppointmentTime());
                    emailVars.put("date", today.toString());
                    emailVars.put("appointmentLink", "http://localhost:5173/appointments/" + appointment.getId());

                    emailService.sendHtmlEmail(
                            appointment.getPatient().getUser().getEmail(),
                            "Sắp đến giờ hẹn khám - ClinicPro",
                            "appointment-reminder",
                            emailVars);

                } catch (Exception e) {
                    log.error("Error sending 30m alert for appointment ID: {}", appointment.getId(), e);
                }
            }
        }
    }
}
