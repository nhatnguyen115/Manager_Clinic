package com.clinic.security;

import com.clinic.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("appointmentSecurity")
@RequiredArgsConstructor
public class AppointmentSecurity {

    private final AppointmentRepository appointmentRepository;

    public boolean isAuthorized(UUID appointmentId, Object principal) {
        if (!(principal instanceof CustomUserDetails userDetails)) {
            return false;
        }

        UUID userId = userDetails.getId();
        return appointmentRepository.findById(appointmentId)
                .map(appointment -> appointment.getPatient().getUser().getId().equals(userId) ||
                        appointment.getDoctor().getUser().getId().equals(userId))
                .orElse(false);
    }
}
