package com.clinic.exception;

import com.clinic.dto.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler globalExceptionHandler;

    @BeforeEach
    void setUp() {
        globalExceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handlingAppException_SuccessfullyMapsErrorCode() {
        // Arrange
        AppException exception = new AppException(ErrorCode.USER_NOT_EXISTED);

        // Act
        ResponseEntity<ApiResponse<?>> response = globalExceptionHandler.handlingAppException(exception);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(ErrorCode.USER_NOT_EXISTED.getCode(), response.getBody().getCode());
        assertEquals(ErrorCode.USER_NOT_EXISTED.getMessage(), response.getBody().getMessage());
    }

    @Test
    void handlingRuntimeException_ReturnsUncategorizedError() {
        // Arrange
        RuntimeException exception = new RuntimeException("Unexpected error");

        // Act
        ResponseEntity<ApiResponse<?>> response = globalExceptionHandler.handlingRuntimeException(exception);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode(), response.getBody().getCode());
        assertEquals(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage(), response.getBody().getMessage());
    }
}
