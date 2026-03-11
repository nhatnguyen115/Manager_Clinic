package com.clinic.service;

import com.clinic.entity.Notification;
import com.clinic.entity.User;
import com.clinic.entity.enums.NotificationType;
import com.clinic.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendNotification(User user, String title, String message, NotificationType type, String entityType,
            UUID entityId) {
        log.info("Creating notification for user: {} - Type: {}", user.getEmail(), type);

        // 1. Save to Database
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .relatedEntityType(entityType)
                .relatedEntityId(entityId)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);

        // Ensure createdAt is populated for the WebSocket push
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(java.time.LocalDateTime.now());
        }

        // 2. Push via WebSocket (STOMP)
        // Destination: /user/{username}/queue/notifications
        // Spring handles mapping /user/ prefix to specific sessions
        String destination = "/queue/notifications";
        messagingTemplate.convertAndSendToUser(user.getEmail(), destination, notification);

        log.info("Notification pushed to WebSocket for user: {}", user.getEmail());
    }
}
