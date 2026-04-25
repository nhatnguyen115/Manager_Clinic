package com.clinic.service;

import com.clinic.dto.request.SpecialtyRequest;
import com.clinic.dto.response.SpecialtyResponse;
import com.clinic.entity.Specialty;
import com.clinic.exception.AppException;
import com.clinic.exception.ErrorCode;
import com.clinic.repository.DoctorRepository;
import com.clinic.repository.SpecialtyRepository;
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
public class SpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private final DoctorRepository doctorRepository;

    public List<SpecialtyResponse> getAllActiveSpecialties() {
        return specialtyRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SpecialtyResponse> getAllSpecialties() {
        return specialtyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SpecialtyResponse getSpecialtyById(UUID id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)); // Update with Specialty Not Found if
                                                                                  // needed
        return mapToResponse(specialty);
    }

    @Transactional
    public SpecialtyResponse createSpecialty(SpecialtyRequest request) {
        if (specialtyRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.USER_EXISTED); // Update with Specialty Existed if needed
        }

        Specialty specialty = Specialty.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();

        return mapToResponse(specialtyRepository.save(specialty));
    }

    @Transactional
    public SpecialtyResponse updateSpecialty(UUID id, SpecialtyRequest request) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        specialty.setName(request.getName());
        specialty.setDescription(request.getDescription());
        specialty.setIcon(request.getIcon());
        if (request.getIsActive() != null) {
            specialty.setIsActive(request.getIsActive());
        }
        if (request.getDisplayOrder() != null) {
            specialty.setDisplayOrder(request.getDisplayOrder());
        }

        return mapToResponse(specialtyRepository.save(specialty));
    }

    @Transactional
    public void deleteSpecialty(UUID id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        specialty.setIsActive(false);
        specialtyRepository.save(specialty);
    }

    private SpecialtyResponse mapToResponse(Specialty specialty) {
        return SpecialtyResponse.builder()
                .id(specialty.getId())
                .name(specialty.getName())
                .description(specialty.getDescription())
                .icon(specialty.getIcon())
                .isActive(specialty.getIsActive())
                .displayOrder(specialty.getDisplayOrder())
                .doctorCount(doctorRepository.countBySpecialtyId(specialty.getId()))
                .build();
    }
}
