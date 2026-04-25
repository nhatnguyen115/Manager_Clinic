package com.clinic.exception;

import com.clinic.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;
import java.util.Objects;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String MIN_ATTRIBUTE = "min";

    // Generic handler for other security-related authentication exceptions
    @ExceptionHandler(value = AuthenticationException.class)
    ResponseEntity<ApiResponse<?>> handlingAuthenticationException(AuthenticationException exception) {
        log.warn("AuthenticationException caught: {}", exception.getMessage());
        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;

        // Specific handling for locked/disabled accounts
        if (exception instanceof org.springframework.security.authentication.DisabledException
                || exception instanceof org.springframework.security.authentication.LockedException) {
            errorCode = ErrorCode.USER_LOCKED;
        }

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<?>> handlingRuntimeException(RuntimeException exception) {
        log.error("Uncaught RuntimeException: {} - {}", exception.getClass().getName(), exception.getMessage(),
                exception);
        ApiResponse<?> apiResponse = new ApiResponse<>();

        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage() + ": " + exception.getMessage());

        return ResponseEntity.status(ErrorCode.UNCATEGORIZED_EXCEPTION.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = HttpMessageNotReadableException.class)
    ResponseEntity<ApiResponse<?>> handlingHttpMessageNotReadableException(HttpMessageNotReadableException exception) {
        log.error("JSON Deserialization Error: ", exception);
        ErrorCode errorCode = ErrorCode.INVALID_KEY;

        String message = "Invalid data format";
        if (exception.getCause() != null) {
            String causeMessage = exception.getCause().getMessage();
            if (causeMessage != null && causeMessage.contains("LocalDate")) {
                message = "Invalid date format. Expected yyyy-MM-dd";
            } else if (causeMessage != null && causeMessage.contains("UUID")) {
                message = "Invalid UUID format";
            } else if (causeMessage != null) {
                // Try to extract field name if available in the message
                message = "Invalid data: "
                        + (causeMessage.length() > 100 ? causeMessage.substring(0, 100) + "..." : causeMessage);
            }
        }

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(message)
                .build();

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<?>> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        ApiResponse<?> apiResponse = new ApiResponse<>();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse<?>> handlingAccessDeniedException(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<?>> handlingValidation(MethodArgumentNotValidException exception) {
        String enumKey = Objects.requireNonNull(exception.getFieldError()).getDefaultMessage();

        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        Map<String, Object> attributes = null;
        String message = enumKey; // Default to the actual validation message

        try {
            errorCode = ErrorCode.valueOf(enumKey);

            var constraintViolation = exception.getBindingResult().getAllErrors().get(0)
                    .unwrap(jakarta.validation.ConstraintViolation.class);

            @SuppressWarnings("unchecked")
            var castAttributes = (Map<String, Object>) (Map<?, ?>) constraintViolation.getConstraintDescriptor()
                    .getAttributes();
            attributes = castAttributes;

            log.info(attributes.toString());
            message = errorCode.getMessage();

        } catch (IllegalArgumentException e) {
            // Keep the original enumKey as message if it's not a valid ErrorCode
        }

        ApiResponse<?> apiResponse = new ApiResponse<>();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(
                Objects.nonNull(attributes)
                        ? mapAttribute(message, attributes)
                        : message);

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    private String mapAttribute(String message, Map<String, Object> attributes) {
        String minValue = String.valueOf(attributes.get(MIN_ATTRIBUTE));

        return message.replace("{" + MIN_ATTRIBUTE + "}", minValue);
    }
}
