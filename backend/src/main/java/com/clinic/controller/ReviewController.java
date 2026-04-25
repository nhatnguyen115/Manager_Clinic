package com.clinic.controller;

import com.clinic.dto.request.ReviewRequest;
import com.clinic.dto.response.ApiResponse;
import com.clinic.dto.response.ReviewResponse;
import com.clinic.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/reviews")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<ReviewResponse> createReview(@Valid @RequestBody ReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .result(reviewService.createReview(request))
                .build();
    }

    @GetMapping("/doctors/{doctorId}/reviews")
    public ApiResponse<List<ReviewResponse>> getDoctorReviews(@PathVariable UUID doctorId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .result(reviewService.getDoctorReviews(doctorId))
                .build();
    }

    @PutMapping("/reviews/{id}")
    @PreAuthorize("hasRole('PATIENT') and @reviewSecurity.isOwner(#id, principal)")
    public ApiResponse<ReviewResponse> updateReview(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .result(reviewService.updateReview(id, request))
                .build();
    }

    @DeleteMapping("/reviews/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PATIENT') and @reviewSecurity.isOwner(#id, principal))")
    public ApiResponse<Void> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ApiResponse.<Void>builder()
                .message("Review deleted successfully")
                .build();
    }
}
