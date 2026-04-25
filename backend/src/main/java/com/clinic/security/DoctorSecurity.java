package com.clinic.security;

import com.clinic.entity.Doctor;
import com.clinic.repository.DoctorRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Component("doctorSecurity")
@RequiredArgsConstructor
public class DoctorSecurity {

    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public boolean isOwner(UUID doctorId, Object principal) {
        if (!(principal instanceof CustomUserDetails userDetails)) {
            return false;
        }

        return doctorRepository.findById(doctorId)
                .map(doctor -> doctor.getUser().getId().equals(userDetails.getId()))
                .orElse(false);
    }
}
