-- =====================================================
-- V7__seed_test_data.sql
-- Seed sample data for development and testing
-- Password for all accounts: Password123
-- BCrypt hash (strength 12): $2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q
-- =====================================================

-- 1. Insert Users (Admin, Doctors, Receptionist, Patients)
INSERT INTO users (id, email, password_hash, full_name, phone, role_id, is_active, email_verified) VALUES
    -- Admin
    (gen_random_uuid(), 'admin@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Hệ thống Admin', '0901234567', (SELECT id FROM roles WHERE name = 'ADMIN'), true, true),
    
    -- Doctors
    (gen_random_uuid(), 'doctor.hung@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Nguyễn Văn Hùng', '0912345678', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true),
    (gen_random_uuid(), 'doctor.lan@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Trần Thị Lan', '0923456789', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true),
    
    -- Receptionist
    (gen_random_uuid(), 'nhanvien.mai@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Nguyễn Thị Mai', '0934567890', (SELECT id FROM roles WHERE name = 'RECEPTIONIST'), true, true),
    
    -- Patients
    (gen_random_uuid(), 'benhnhan.tuan@gmail.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Lê Anh Tuấn', '0945678901', (SELECT id FROM roles WHERE name = 'PATIENT'), true, true),
    (gen_random_uuid(), 'benhnhan.hoa@gmail.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Phạm Minh Hoa', '0956789012', (SELECT id FROM roles WHERE name = 'PATIENT'), true, true),
    (gen_random_uuid(), 'benhnhan.an@gmail.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Đặng Văn An', '0967890123', (SELECT id FROM roles WHERE name = 'PATIENT'), true, true);

-- 2. Link Doctors to Specialties and create Doctor profiles
INSERT INTO doctors (id, user_id, specialty_id, experience_years, consultation_fee, bio) VALUES
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com'), (SELECT id FROM specialties WHERE name = 'Tim mạch'), 15, 500000, 'Chuyên gia tim mạch với 15 năm kinh nghiệm tại các bệnh viện lớn.'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'doctor.lan@clinicpro.com'), (SELECT id FROM specialties WHERE name = 'Nhi khoa'), 10, 300000, 'Bác sĩ nhi khoa tận tâm, yêu trẻ.');

-- 3. Create Patient profiles
INSERT INTO patients (id, user_id, date_of_birth, gender, address, blood_type) VALUES
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'benhnhan.tuan@gmail.com'), '1990-05-15', 'MALE', '123 Đường Láng, Hà Nội', 'O+'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'benhnhan.hoa@gmail.com'), '1995-10-20', 'FEMALE', '456 Lê Lợi, Đà Nẵng', 'A+'),
    (gen_random_uuid(), (SELECT id FROM users WHERE email = 'benhnhan.an@gmail.com'), '1988-12-30', 'MALE', '789 Nguyễn Huệ, TP.HCM', 'B+');

-- 4. Create Appointments
-- Past Appointment (Completed)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, symptoms) VALUES
    (gen_random_uuid(), (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.tuan@gmail.com')), (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com')), CURRENT_DATE - INTERVAL '7' DAY, '09:00:00', 'COMPLETED', 'Đau ngực trái');

-- Future Appointment (Confirmed)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, symptoms) VALUES
    (gen_random_uuid(), (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.hoa@gmail.com')), (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.lan@clinicpro.com')), CURRENT_DATE + INTERVAL '2' DAY, '14:30:00', 'CONFIRMED', 'Kiểm tra sức khỏe định kỳ cho bé');

-- Pending Appointment
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, symptoms) VALUES
    (gen_random_uuid(), (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.an@gmail.com')), (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com')), CURRENT_DATE + INTERVAL '1' DAY, '10:00:00', 'PENDING', 'Tư vấn tim mạch');

-- 5. Create Medical Records for Completed Appointment
INSERT INTO medical_records (id, appointment_id, patient_id, doctor_id, diagnosis, symptoms, treatment, vital_signs) VALUES
    (gen_random_uuid(), (SELECT id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), (SELECT patient_id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), (SELECT doctor_id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), 'Rối loạn nhịp tim nhẹ', 'Hồi hộp, đánh trống ngực', 'Nghỉ ngơi, hạn chế chất kích thích', '{"weight": 70, "height": 175, "temp": 36.6, "bp": "120/80"}');

-- 6. Create Payments
INSERT INTO payments (id, appointment_id, patient_id, amount, payment_method, status, paid_at) VALUES
    (gen_random_uuid(), (SELECT id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), (SELECT patient_id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), 500000, 'CASH', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '7' DAY);

-- 7. Create Reviews
INSERT INTO reviews (id, patient_id, doctor_id, appointment_id, rating, comment) VALUES
    (gen_random_uuid(), (SELECT patient_id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), (SELECT doctor_id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), (SELECT id FROM appointments WHERE status = 'COMPLETED' LIMIT 1), 5, 'Bác sĩ rất nhiệt tình và chuyên nghiệp.');
