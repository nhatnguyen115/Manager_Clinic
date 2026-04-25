package com.clinic.service;

import com.clinic.dto.request.ReviewRequest;
import com.clinic.dto.response.ReviewResponse;
import com.clinic.entity.Appointment;
import com.clinic.entity.Doctor;
import com.clinic.entity.Review;
import com.clinic.entity.enums.AppointmentStatus;
import com.clinic.exception.AppException;
import com.clinic.exception.ErrorCode;
import com.clinic.repository.AppointmentRepository;
import com.clinic.repository.DoctorRepository;
import com.clinic.repository.ReviewRepository;
import com.clinic.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_FOUND));

        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();

        // Owner check
        if (!appointment.getPatient().getUser().getId().equals(userDetails.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Must be completed
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        // Check if already reviewed
        if (reviewRepository.findByAppointmentId(appointment.getId()).isPresent()) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Review review = Review.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .rating(request.getRating())
                .comment(request.getComment())
                .isAnonymous(request.getIsAnonymous())
                .isVisible(true)
                .build();

        Review savedReview = reviewRepository.save(review);
        updateDoctorStats(review.getDoctor().getId());
        return mapToResponse(savedReview);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getDoctorReviews(UUID doctorId) {
        return reviewRepository.findByDoctorIdAndIsVisibleTrueOrderByCreatedAtDesc(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse updateReview(UUID id, ReviewRequest request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setIsAnonymous(request.getIsAnonymous());

        Review savedReview = reviewRepository.save(review);
        updateDoctorStats(review.getDoctor().getId());
        return mapToResponse(savedReview);
    }

    @Transactional
    public void deleteReview(UUID id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));
        UUID doctorId = review.getDoctor().getId();
        reviewRepository.delete(review);
        updateDoctorStats(doctorId);
    }

    private void updateDoctorStats(UUID doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));

        Double avgRating = reviewRepository.getAverageRatingByDoctorId(doctorId);
        Long count = reviewRepository.countByDoctorId(doctorId);

        doctor.setAvgRating(
                avgRating != null ? BigDecimal.valueOf(avgRating).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        doctor.setTotalReviews(count != null ? count.intValue() : 0);

        doctorRepository.save(doctor);
    }

    private ReviewResponse mapToResponse(Review review) {
        String patientName = "Ẩn danh";
        if (!Boolean.TRUE.equals(review.getIsAnonymous()) && review.getPatient() != null
                && review.getPatient().getUser() != null) {
            patientName = review.getPatient().getUser().getFullName();
        }

        String doctorName = "Bác sĩ";
        if (review.getDoctor() != null && review.getDoctor().getUser() != null) {
            doctorName = review.getDoctor().getUser().getFullName();
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .patientName(patientName)
                .doctorId(review.getDoctor() != null ? review.getDoctor().getId() : null)
                .doctorName(doctorName)
                .rating(review.getRating())
                .comment(review.getComment())
                .isAnonymous(review.getIsAnonymous())
                .adminResponse(review.getAdminResponse())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
