package com.clinic.security;

import com.clinic.entity.Patient;
import com.clinic.repository.PatientRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Component("patientSecurity")
@RequiredArgsConstructor
public class PatientSecurity {

    private final PatientRepository patientRepository;

    public boolean isOwner(UUID patientId, Object principal) {
        if (!(principal instanceof CustomUserDetails userDetails)) {
            return false;
        }

        return patientRepository.findById(patientId)
                .map(patient -> patient.getUser().getId().equals(userDetails.getId()))
                .orElse(false);
    }
}
