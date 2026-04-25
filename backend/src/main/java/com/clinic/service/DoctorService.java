package com.clinic.service;

import com.clinic.dto.request.DoctorRequest;
import com.clinic.dto.response.DoctorResponse;
import com.clinic.entity.Doctor;
import com.clinic.entity.Specialty;
import com.clinic.entity.User;
import com.clinic.exception.AppException;
import com.clinic.exception.ErrorCode;
import com.clinic.repository.DoctorRepository;
import com.clinic.repository.SpecialtyRepository;
import com.clinic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final SpecialtyRepository specialtyRepository;

    public List<DoctorResponse> getAllDoctors(UUID specialtyId) {
        List<Doctor> doctors;
        if (specialtyId != null) {
            doctors = doctorRepository.findBySpecialtyIdAndIsAvailableTrue(specialtyId,
                    org.springframework.data.domain.Pageable.unpaged()).getContent();
        } else {
            doctors = doctorRepository.findAll();
        }
        return doctors.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DoctorResponse getDoctorById(UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return mapToResponse(doctor);
    }

    @Transactional
    public DoctorResponse createDoctor(DoctorRequest request) {
        if (request.getUserId() == null) {
            throw new AppException(ErrorCode.INVALID_KEY); // Or specific error
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (doctorRepository.existsByUserId(user.getId())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Specialty specialty = null;
        if (request.getSpecialtyId() != null) {
            specialty = specialtyRepository.findById(request.getSpecialtyId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY)); // Specialty not found
        }

        Doctor doctor = Doctor.builder()
                .user(user)
                .specialty(specialty)
                .bio(request.getBio())
                .experienceYears(request.getExperienceYears())
                .licenseNumber(request.getLicenseNumber())
                .consultationFee(request.getConsultationFee())
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .education(request.getEducation())
                .certifications(request.getCertifications())
                .build();

        return mapToResponse(doctorRepository.save(doctor));
    }

    @Transactional
    public DoctorResponse updateDoctor(UUID id, DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        User user = doctor.getUser();
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhoneNumber());
        userRepository.save(user);

        if (request.getSpecialtyId() != null) {
            Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)); // Replace with Specialty NOT
                                                                                      // FOUND if available
            doctor.setSpecialty(specialty);
        }

        doctor.setBio(request.getBio());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setIsAvailable(request.getIsAvailable());
        doctor.setEducation(request.getEducation());
        doctor.setCertifications(request.getCertifications());

        return mapToResponse(doctorRepository.save(doctor));
    }

    private DoctorResponse mapToResponse(Doctor doctor) {
        User user = doctor.getUser();
        return DoctorResponse.builder()
                .id(doctor.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .bio(doctor.getBio())
                .experienceYears(doctor.getExperienceYears())
                .licenseNumber(doctor.getLicenseNumber())
                .consultationFee(doctor.getConsultationFee())
                .isAvailable(doctor.getIsAvailable())
                .specialtyId(doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null)
                .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                .avgRating(doctor.getAvgRating())
                .totalReviews(doctor.getTotalReviews())
                .education(doctor.getEducation())
                .certifications(doctor.getCertifications())
                .build();
    }
}
