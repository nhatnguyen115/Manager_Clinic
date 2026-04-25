package com.clinic.service;

import com.clinic.entity.AuditLog;
import com.clinic.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(UUID userId, String action, String entityType, String entityId, String oldValue, String newValue) {
        try {
            HttpServletRequest request = null;
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes != null) {
                request = attributes.getRequest();
            }

            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .ipAddress(request != null ? request.getRemoteAddr() : "unknown")
                    .userAgent(request != null ? request.getHeader("User-Agent") : "unknown")
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log saved: {} - {} - {}", userId, action, entityId);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
            // We don't want to fail the main transaction if logging fails
        }
    }

    public void log(UUID userId, String action, String entityType, String entityId) {
        log(userId, action, entityType, entityId, null, null);
    }
}
