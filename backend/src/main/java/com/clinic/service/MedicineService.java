package com.clinic.service;

import com.clinic.dto.request.MedicineRequest;
import com.clinic.dto.response.MedicineResponse;
import com.clinic.entity.Medicine;
import com.clinic.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;

    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .filter(m -> m.getIsActive())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .genericName(request.getGenericName())
                .dosageForm(request.getDosageForm())
                .strength(request.getStrength())
                .manufacturer(request.getManufacturer())
                .description(request.getDescription())
                .sideEffects(request.getSideEffects())
                .contraindications(request.getContraindications())
                .isPrescription(request.getIsPrescription())
                .isActive(request.getIsActive())
                .build();

        return mapToResponse(medicineRepository.save(medicine));
    }

    private MedicineResponse mapToResponse(Medicine medicine) {
        return MedicineResponse.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .genericName(medicine.getGenericName())
                .dosageForm(medicine.getDosageForm())
                .strength(medicine.getStrength())
                .manufacturer(medicine.getManufacturer())
                .description(medicine.getDescription())
                .sideEffects(medicine.getSideEffects())
                .contraindications(medicine.getContraindications())
                .isPrescription(medicine.getIsPrescription())
                .isActive(medicine.getIsActive())
                .build();
    }
}
