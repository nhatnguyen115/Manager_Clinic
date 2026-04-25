package com.clinic.controller;

import com.clinic.dto.response.ApiResponse;
import com.clinic.entity.Notification;
import com.clinic.entity.User;
import com.clinic.repository.NotificationRepository;
import com.clinic.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notification", description = "Notification Management APIs")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get user notifications")
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository.findAllByUserOrderByCreatedAtDesc(user, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<Notification>>builder()
                .result(notifications)
                .build());
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        User user = getCurrentUser();
        long count = notificationRepository.countByUserAndIsReadFalse(user);
        return ResponseEntity.ok(ApiResponse.<Long>builder().result(count).build());
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            if (notification.getUser().getId().equals(getCurrentUser().getId())) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        });
        return ResponseEntity.ok(ApiResponse.<Void>builder().message("Marked as read").build());
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User user = getCurrentUser();
        notificationRepository.markAllAsReadByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.<Void>builder().message("Marked all as read").build());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
