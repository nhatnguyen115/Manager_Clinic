package com.clinic.security;

import com.clinic.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("medicalRecordSecurity")
@RequiredArgsConstructor
public class MedicalRecordSecurity {

    private final MedicalRecordRepository medicalRecordRepository;

    public boolean isAuthorized(UUID recordId, Object principal) {
        if (!(principal instanceof CustomUserDetails userDetails)) {
            return false;
        }

        UUID userId = userDetails.getId();
        return medicalRecordRepository.findById(recordId)
                .map(record -> record.getPatient().getUser().getId().equals(userId) ||
                        record.getDoctor().getUser().getId().equals(userId))
                .orElse(false);
    }
}
