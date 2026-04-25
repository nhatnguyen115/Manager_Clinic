package com.clinic.service;

import com.clinic.dto.request.PasswordChangeRequest;
import com.clinic.dto.request.ProfileUpdateRequest;
import com.clinic.dto.response.UserResponse;
import com.clinic.entity.User;
import com.clinic.exception.AppException;
import com.clinic.exception.ErrorCode;
import com.clinic.repository.UserRepository;
import com.clinic.repository.DoctorRepository;
import com.clinic.repository.PatientRepository;
import com.clinic.repository.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileService fileService;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final SpecialtyRepository specialtyRepository;

    @Transactional
    public String uploadAvatar(UUID id, MultipartFile file) throws IOException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String avatarUrl = fileService.uploadFile(file, "avatars");
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        return avatarUrl;
    }

    @Transactional(readOnly = true)
    public UserResponse getMyProfile(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UUID id, ProfileUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());

        userRepository.save(user);

        // Update role-specific profile
        if (user.getRole() != null) {
            String roleName = user.getRole().getName().name();
            if ("DOCTOR".equals(roleName)) {
                doctorRepository.findByUserId(user.getId()).ifPresent(doctor -> {
                    doctor.setBio(request.getBio());
                    doctor.setExperienceYears(request.getExperienceYears());
                    doctor.setLicenseNumber(request.getLicenseNumber());
                    doctor.setConsultationFee(request.getConsultationFee());
                    doctor.setEducation(request.getEducation());
                    doctor.setCertifications(request.getCertifications());
                    doctor.setDateOfBirth(request.getDateOfBirth());
                    doctor.setGender(parseGender(request.getGender()));
                    doctor.setAddress(request.getAddress());
                    doctor.setCity(request.getCity());

                    if (request.getSpecialtyId() != null) {
                        specialtyRepository.findById(request.getSpecialtyId())
                                .ifPresent(doctor::setSpecialty);
                    }

                    doctorRepository.save(doctor);
                });
            } else if ("PATIENT".equals(roleName)) {
                patientRepository.findByUserId(user.getId()).ifPresent(patient -> {
                    patient.setDateOfBirth(request.getDateOfBirth());
                    patient.setGender(parseGender(request.getGender()));
                    patient.setAddress(request.getAddress());
                    patient.setCity(request.getCity());
                    patient.setBloodType(request.getBloodType());
                    patient.setAllergies(request.getAllergies());
                    patient.setChronicDiseases(request.getChronicDiseases());
                    patient.setEmergencyContactName(request.getEmergencyContactName());
                    patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
                    patient.setInsuranceNumber(request.getInsuranceNumber());
                    patientRepository.save(patient);
                });
            }
        }

        return mapToResponse(user);
    }

    private com.clinic.entity.enums.Gender parseGender(String gender) {
        if (gender == null)
            return null;
        try {
            return com.clinic.entity.enums.Gender.valueOf(gender.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @Transactional
    public void changePassword(UUID id, PasswordChangeRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED); // Or a more specific error
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user != null ? user.getId() : null)
                .email(user != null ? user.getEmail() : null)
                .fullName(user != null ? user.getFullName() : null)
                .phone(user != null ? user.getPhone() : null)
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .role(user != null && user.getRole() != null ? user.getRole().getName().name() : null)
                .isActive(user != null && user.getIsActive());

        if (user != null && user.getRole() != null && user.getRole().getName() != null) {
            String roleName = user.getRole().getName().name();
            if ("DOCTOR".equals(roleName)) {
                doctorRepository.findByUserId(user.getId()).ifPresent(doctor -> {
                    builder.doctorId(doctor.getId())
                            .bio(doctor.getBio())
                            .experienceYears(doctor.getExperienceYears())
                            .licenseNumber(doctor.getLicenseNumber())
                            .consultationFee(doctor.getConsultationFee())
                            .education(doctor.getEducation())
                            .certifications(doctor.getCertifications())
                            .dateOfBirth(doctor.getDateOfBirth())
                            .gender(doctor.getGender() != null ? doctor.getGender().name() : null)
                            .address(doctor.getAddress())
                            .city(doctor.getCity());
                    if (doctor.getSpecialty() != null) {
                        builder.specialtyId(doctor.getSpecialty().getId())
                                .specialtyName(doctor.getSpecialty().getName());
                    }
                });
            } else if ("PATIENT".equals(roleName)) {
                patientRepository.findByUserId(user.getId()).ifPresent(patient -> {
                    builder.patientId(patient.getId())
                            .dateOfBirth(patient.getDateOfBirth())
                            .gender(patient.getGender() != null ? patient.getGender().name() : null)
                            .address(patient.getAddress())
                            .city(patient.getCity())
                            .bloodType(patient.getBloodType())
                            .allergies(patient.getAllergies())
                            .chronicDiseases(patient.getChronicDiseases())
                            .emergencyContactName(patient.getEmergencyContactName())
                            .emergencyContactPhone(patient.getEmergencyContactPhone())
                            .insuranceNumber(patient.getInsuranceNumber());
                });
            }
        }

        return builder.build();
    }
}
