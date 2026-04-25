package com.clinic.service;

import com.clinic.dto.request.ReviewRequest;
import com.clinic.dto.response.ReviewResponse;
import com.clinic.entity.Appointment;
import com.clinic.entity.Review;
import com.clinic.exception.AppException;
import com.clinic.exception.ErrorCode;
import com.clinic.repository.AppointmentRepository;
import com.clinic.repository.ReviewRepository;
import com.clinic.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;

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

        return mapToResponse(reviewRepository.save(review));
    }

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

        return mapToResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(UUID id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));
        reviewRepository.delete(review);
    }

    private ReviewResponse mapToResponse(Review review) {
        String patientName = review.getIsAnonymous() ? "Anonymous" : review.getPatient().getUser().getFullName();
        return ReviewResponse.builder()
                .id(review.getId())
                .patientName(patientName)
                .doctorId(review.getDoctor().getId())
                .doctorName(review.getDoctor().getUser().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .isAnonymous(review.getIsAnonymous())
                .adminResponse(review.getAdminResponse())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
