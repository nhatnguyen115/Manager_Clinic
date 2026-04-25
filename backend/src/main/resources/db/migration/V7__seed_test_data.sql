-- =====================================================
-- V7__seed_test_data.sql
-- Seed sample data for development and testing
-- Password for all accounts: Password123
-- BCrypt hash (strength 12): $2a$12$D4n09EBRWthp4.yF5.M9E.t7o.5Mv0YV3pBv.l3K.A7H/1h2K.S8m
-- =====================================================

-- 1. Insert Users (Admin, Doctors, Receptionist, Patients)
INSERT INTO users (id, email, password_hash, full_name, phone, role_id, is_active, email_verified) VALUES
    -- Admin
    (random_uuid(), 'admin@clinicpro.com', '$2a$12$D4n09EBRWthp4.yF5.M9E.t7o.5Mv0YV3pBv.l3K.A7H/1h2K.S8m', 'Hệ thống Admin', '0901234567', (SELECT id FROM roles WHERE name = 'ADMIN'), true, true),
    
    -- Doctors
    (random_uuid(), 'doctor.hung@clinicpro.com', '$2a$12$D4n09EBRWthp4.yF5.M9E.t7o.5Mv0YV3pBv.l3K.A7H/1h2K.S8m', 'BS. Nguyễn Văn Hùng', '0912345678', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true),
    (random_uuid(), 'doctor.lan@clinicpro.com', '$2a$12$D4n09EBRWthp4.yF5.M9E.t7o.5Mv0YV3pBv.l3K.A7H/1h2K.S8m', 'BS. Trần Thị Lan', '0923456789', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true),
    
    -- Receptionist
    (random_uuid(), 'nhanvien.mai@clinicpro.com', '$2a$12$D4n09EBRWthp4.yF5.M9E.t7o.5Mv0YV3pBv.l3K.A7H/1h2K.S8m', 'Nguyễn Thị Mai', '0934567890', (SELECT id FROM roles WHERE name = 'RECEPTIONIST'), true, true),
    
    -- Patients
    (random_uuid(), 'benhnhan.tuan@gmail.com', '$2a$12$D4n09EBRWthp4.yF5.M9E.t7o.5Mv0YV3pBv.l3K.A7H/1h2K.S8m', 'Lê Anh Tuấn', '0945678901', (SELECT id FROM roles WHERE name = 'PATIENT'), true, true),
    (random_uuid(), 'benhnhan.hoa@gmail.com', '$2a$12$D4n09EBRWthp4.yF5.M9E.t7o.5Mv0YV3pBv.l3K.A7H/1h2K.S8m', 'Phạm Minh Hoa', '0956789012', (SELECT id FROM roles WHERE name = 'PATIENT'), true, true),
    (random_uuid(), 'benhnhan.an@gmail.com', '$2a$12$D4n09EBRWthp4.yF5.M9E.t7o.5Mv0YV3pBv.l3K.A7H/1h2K.S8m', 'Đặng Văn An', '0967890123', (SELECT id FROM roles WHERE name = 'PATIENT'), true, true);

-- 2. Link Doctors to Specialties and create Doctor profiles
INSERT INTO doctors (id, user_id, specialty_id, experience_years, consultation_fee, bio) VALUES
    (random_uuid(), (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com'), (SELECT id FROM specialties WHERE name = 'Tim mạch'), 15, 500000, 'Chuyên gia tim mạch với 15 năm kinh nghiệm tại các bệnh viện lớn.'),
    (random_uuid(), (SELECT id FROM users WHERE email = 'doctor.lan@clinicpro.com'), (SELECT id FROM specialties WHERE name = 'Nhi khoa'), 10, 300000, 'Bác sĩ nhi khoa tận tâm, yêu trẻ.');

-- 3. Create Patient profiles
INSERT INTO patients (id, user_id, date_of_birth, gender, address, blood_type) VALUES
    (random_uuid(), (SELECT id FROM users WHERE email = 'benhnhan.tuan@gmail.com'), '1990-05-15', 'MALE', '123 Đường Láng, Hà Nội', 'O+'),
    (random_uuid(), (SELECT id FROM users WHERE email = 'benhnhan.hoa@gmail.com'), '1995-10-20', 'FEMALE', '456 Lê Lợi, Đà Nẵng', 'A+'),
    (random_uuid(), (SELECT id FROM users WHERE email = 'benhnhan.an@gmail.com'), '1988-12-30', 'MALE', '789 Nguyễn Huệ, TP.HCM', 'B+');

-- 4. Create Appointments
-- Past Appointment (Completed)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, symptoms) VALUES
    (random_uuid(), (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.tuan@gmail.com')), (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com')), CURRENT_DATE - INTERVAL '7' DAY, '09:00:00', 'COMPLETED', 'Đau ngực trái');

-- Future Appointment (Confirmed)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, symptoms) VALUES
    (random_uuid(), (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.hoa@gmail.com')), (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.lan@clinicpro.com')), CURRENT_DATE + INTERVAL '2' DAY, '14:30:00', 'CONFIRMED', 'Kiểm tra sức khỏe định kỳ cho bé');

-- Pending Appointment
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, symptoms) VALUES
    (random_uuid(), (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.an@gmail.com')), (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com')), CURRENT_DATE + INTERVAL '1' DAY, '10:00:00', 'PENDING', 'Tư vấn tim mạch');

-- 5. Create Medical Records for Completed Appointment
INSERT INTO medical_records (id, appointment_id, patient_id, doctor_id, diagnosis, symptoms, treatment, vital_signs) VALUES
    (random_uuid(), (SELECT id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), (SELECT patient_id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), (SELECT doctor_id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), 'Rối loạn nhịp tim nhẹ', 'Hồi hộp, đánh trống ngực', 'Nghỉ ngơi, hạn chế chất kích thích', '{"weight": 70, "height": 175, "temp": 36.6, "bp": "120/80"}');

-- 6. Create Payments
INSERT INTO payments (id, appointment_id, patient_id, amount, payment_method, status, paid_at) VALUES
    (random_uuid(), (SELECT id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), (SELECT patient_id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), 500000, 'CASH', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '7' DAY);

-- 7. Create Reviews
INSERT INTO reviews (id, patient_id, doctor_id, appointment_id, rating, comment) VALUES
    (random_uuid(), (SELECT patient_id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), (SELECT doctor_id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), (SELECT id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), 5, 'Bác sĩ rất nhiệt tình và chuyên nghiệp.');
