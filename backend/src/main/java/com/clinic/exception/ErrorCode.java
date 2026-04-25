package com.clinic.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least 4 characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least 6 characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_REGISTERED(1009, "Email already registered", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1010, "Role not found", HttpStatus.NOT_FOUND),

    // Appointment errors
    APPOINTMENT_SLOT_TAKEN(2001, "This time slot is already taken", HttpStatus.BAD_REQUEST),
    APPOINTMENT_NOT_FOUND(2002, "Appointment not found", HttpStatus.NOT_FOUND),
    APPOINTMENT_CANCEL_FORBIDDEN(2003, "Cannot cancel this appointment", HttpStatus.BAD_REQUEST),
    MEDICINE_NOT_FOUND(2004, "Medicine not found", HttpStatus.NOT_FOUND),
    REVIEW_ALREADY_EXISTS(2005, "You have already reviewed this appointment", HttpStatus.BAD_REQUEST),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
