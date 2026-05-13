package com.clinic.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "Người dùng đã tồn tại", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Tên đăng nhập phải có ít nhất 4 ký tự", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Mật khẩu phải có ít nhất 6 ký tự", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "Email không tồn tại trong hệ thống", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Tuổi của bạn phải ít nhất {min}", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_REGISTERED(1009, "Email này đã được đăng ký", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1010, "Không tìm thấy vai trò", HttpStatus.NOT_FOUND),
    USER_LOCKED(1011, "Tài khoản của bạn đã bị khóa", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(1012, "Mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),

    // Lỗi lịch hẹn
    APPOINTMENT_SLOT_TAKEN(2001, "Khung giờ này đã có người đặt", HttpStatus.BAD_REQUEST),
    APPOINTMENT_NOT_FOUND(2002, "Không tìm thấy lịch hẹn", HttpStatus.NOT_FOUND),
    APPOINTMENT_CANCEL_FORBIDDEN(2003, "Không thể hủy lịch hẹn này", HttpStatus.BAD_REQUEST),
    MEDICINE_NOT_FOUND(2004, "Không tìm thấy thuốc", HttpStatus.NOT_FOUND),
    REVIEW_ALREADY_EXISTS(2005, "Bạn đã đánh giá lịch hẹn này rồi", HttpStatus.BAD_REQUEST),
    APPOINTMENT_PAYMENT_NOT_READY(2006, "Lịch hẹn chưa sẵn sàng để thanh toán", HttpStatus.BAD_REQUEST),
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
