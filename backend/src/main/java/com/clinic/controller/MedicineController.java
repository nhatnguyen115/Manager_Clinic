package com.clinic.controller;

import com.clinic.dto.request.MedicineRequest;
import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.MedicineResponse;
import com.clinic.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

        private final MedicineService medicineService;

        @GetMapping
        public ApiResponse<List<MedicineResponse>> getAllMedicines() {
                return ApiResponse.<List<MedicineResponse>>builder()
                                .result(medicineService.getAllMedicines())
                                .build();
        }

        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ApiResponse<MedicineResponse> createMedicine(@Valid @RequestBody MedicineRequest request) {
                return ApiResponse.<MedicineResponse>builder()
                                .result(medicineService.createMedicine(request))
                                .build();
        }
}
