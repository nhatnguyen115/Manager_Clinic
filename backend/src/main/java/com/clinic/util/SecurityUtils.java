package com.clinic.util;

import com.clinic.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class SecurityUtils {

    /**
     * Lấy ID của người dùng đang đăng nhập từ SecurityContext.
     */
    public Optional<UUID> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();

        // CustomUserDetails chứa ID
        if (principal instanceof CustomUserDetails) {
            return Optional.of(((CustomUserDetails) principal).getId());
        }

        // Nếu principal là String (JWT subject), có thể là ID dạng chuỗi
        if (principal instanceof String) {
            try {
                return Optional.of(UUID.fromString((String) principal));
            } catch (IllegalArgumentException e) {
                return Optional.empty();
            }
        }

        return Optional.empty();
    }
}
