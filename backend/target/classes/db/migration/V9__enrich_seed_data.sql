-- =====================================================
-- V9__enrich_seed_data.sql
-- Enrich test data to match frontend expectations:
--   1. Fix specialty icons → PascalCase (frontend iconMap)
--   2. Add more doctors across specialties
--   3. Add working schedules & time slots
--   4. Add more appointments, medical records, prescriptions
-- =====================================================

-- ====================================================
-- 1. FIX SPECIALTY ICONS → PascalCase
-- Frontend iconMap: Stethoscope, Heart, Eye, Brain, Baby, Bone, Activity
-- ====================================================
UPDATE specialties SET icon = 'Stethoscope'  WHERE name = 'Nội khoa';
UPDATE specialties SET icon = 'Baby'         WHERE name = 'Nhi khoa';
UPDATE specialties SET icon = 'Activity'     WHERE name = 'Da liễu';
UPDATE specialties SET icon = 'Heart'        WHERE name = 'Tim mạch';
UPDATE specialties SET icon = 'Brain'        WHERE name = 'Thần kinh';
UPDATE specialties SET icon = 'Bone'         WHERE name = 'Cơ xương khớp';
UPDATE specialties SET icon = 'Stethoscope'  WHERE name = 'Tai mũi họng';
UPDATE specialties SET icon = 'Stethoscope'  WHERE name = 'Răng hàm mặt';
UPDATE specialties SET icon = 'Baby'         WHERE name = 'Sản phụ khoa';
UPDATE specialties SET icon = 'Eye'          WHERE name = 'Mắt';

-- ====================================================
-- 2. ADD MORE DOCTORS (4 new doctors across specialties)
-- Password: Password123
-- ====================================================
INSERT INTO users (id, email, password_hash, full_name, phone, role_id, is_active, email_verified) VALUES
    (gen_random_uuid(), 'doctor.minh@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Phạm Đức Minh', '0971234567', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true),
    (gen_random_uuid(), 'doctor.thao@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Lê Thị Thảo', '0982345678', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true),
    (gen_random_uuid(), 'doctor.nam@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Hoàng Văn Nam', '0993456789', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true),
    (gen_random_uuid(), 'doctor.linh@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Ngô Thị Linh', '0904567890', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true);

INSERT INTO doctors (id, user_id, specialty_id, experience_years, consultation_fee, bio, license_number, education, certifications, avg_rating, total_reviews) VALUES
    -- Nội khoa doctor
    (gen_random_uuid(),
     (SELECT id FROM users WHERE email = 'doctor.minh@clinicpro.com'),
     (SELECT id FROM specialties WHERE name = 'Nội khoa'),
     12, 400000,
     'Bác sĩ chuyên khoa Nội tổng hợp với hơn 12 năm kinh nghiệm. Chuyên sâu về bệnh tiêu hóa và hô hấp.',
     'BS-NKH-001',
     ARRAY['Đại học Y Hà Nội - 2012', 'Chuyên khoa I - Nội tổng hợp - 2016'],
     ARRAY['Chứng chỉ siêu âm tổng quát', 'Hội viên Hội Nội khoa Việt Nam'],
     4.7, 89),

    -- Thần kinh doctor
    (gen_random_uuid(),
     (SELECT id FROM users WHERE email = 'doctor.thao@clinicpro.com'),
     (SELECT id FROM specialties WHERE name = 'Thần kinh'),
     8, 450000,
     'Chuyên gia thần kinh với kinh nghiệm điều trị đau đầu, mất ngủ, và các bệnh lý về hệ thần kinh trung ương.',
     'BS-TK-002',
     ARRAY['Đại học Y Dược TP.HCM - 2015', 'Thạc sĩ Y khoa - Thần kinh học - 2019'],
     ARRAY['Chứng chỉ điện não đồ (EEG)', 'Chứng nhận quốc tế về đau đầu'],
     4.8, 56),

    -- Da liễu doctor
    (gen_random_uuid(),
     (SELECT id FROM users WHERE email = 'doctor.nam@clinicpro.com'),
     (SELECT id FROM specialties WHERE name = 'Da liễu'),
     6, 350000,
     'Bác sĩ da liễu chuyên điều trị mụn trứng cá, viêm da cơ địa, và các phương pháp thẩm mỹ da.',
     'BS-DL-003',
     ARRAY['Đại học Y Hà Nội - 2017', 'Chuyên khoa I - Da liễu - 2021'],
     ARRAY['Chứng chỉ laser da liễu', 'Chứng nhận điều trị mụn quốc tế'],
     4.5, 42),

    -- Mắt doctor
    (gen_random_uuid(),
     (SELECT id FROM users WHERE email = 'doctor.linh@clinicpro.com'),
     (SELECT id FROM specialties WHERE name = 'Mắt'),
     9, 380000,
     'Bác sĩ nhãn khoa chuyên điều trị tật khúc xạ, đục thủy tinh thể và các bệnh lý về mắt.',
     'BS-MK-004',
     ARRAY['Đại học Y Dược Huế - 2014', 'Thạc sĩ Y khoa - Nhãn khoa - 2018'],
     ARRAY['Chứng chỉ phẫu thuật LASIK', 'Hội viên Hội Nhãn khoa Việt Nam'],
     4.9, 73);

-- Update existing doctors with more details
UPDATE doctors SET
    license_number = 'BS-TM-005',
    education = ARRAY['Đại học Y Hà Nội - 2008', 'Tiến sĩ Y khoa - Tim mạch - 2015'],
    certifications = ARRAY['Chứng chỉ can thiệp tim mạch', 'Hội viên Hội Tim mạch Việt Nam'],
    avg_rating = 4.9,
    total_reviews = 124
WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com');

UPDATE doctors SET
    license_number = 'BS-NK-006',
    education = ARRAY['Đại học Y Dược TP.HCM - 2013', 'Chuyên khoa I - Nhi khoa - 2017'],
    certifications = ARRAY['Chứng chỉ hồi sức nhi', 'Chứng nhận tiêm chủng quốc tế'],
    avg_rating = 4.6,
    total_reviews = 67
WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.lan@clinicpro.com');

-- ====================================================
-- 3. WORKING SCHEDULES & TIME SLOTS
-- Create Mon-Fri schedule for each doctor with standard time slots
-- ====================================================

-- Helper: Insert 5-day schedule (Mon=1 ... Fri=5) for each doctor
-- Doctor Hùng (Tim mạch)
INSERT INTO working_schedules (doctor_id, day_of_week, is_available) VALUES
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com')), 1, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com')), 2, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com')), 3, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com')), 4, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.hung@clinicpro.com')), 5, true);

-- Doctor Lan (Nhi khoa)
INSERT INTO working_schedules (doctor_id, day_of_week, is_available) VALUES
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.lan@clinicpro.com')), 1, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.lan@clinicpro.com')), 2, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.lan@clinicpro.com')), 3, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.lan@clinicpro.com')), 4, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.lan@clinicpro.com')), 5, true);

-- Doctor Minh (Nội khoa)
INSERT INTO working_schedules (doctor_id, day_of_week, is_available) VALUES
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.minh@clinicpro.com')), 1, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.minh@clinicpro.com')), 2, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.minh@clinicpro.com')), 3, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.minh@clinicpro.com')), 4, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.minh@clinicpro.com')), 5, true);

-- Doctor Thảo (Thần kinh)
INSERT INTO working_schedules (doctor_id, day_of_week, is_available) VALUES
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.thao@clinicpro.com')), 1, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.thao@clinicpro.com')), 2, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.thao@clinicpro.com')), 3, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.thao@clinicpro.com')), 4, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.thao@clinicpro.com')), 5, true);

-- Doctor Nam (Da liễu)
INSERT INTO working_schedules (doctor_id, day_of_week, is_available) VALUES
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.nam@clinicpro.com')), 1, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.nam@clinicpro.com')), 2, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.nam@clinicpro.com')), 3, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.nam@clinicpro.com')), 4, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.nam@clinicpro.com')), 5, true);

-- Doctor Linh (Mắt)
INSERT INTO working_schedules (doctor_id, day_of_week, is_available) VALUES
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.linh@clinicpro.com')), 1, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.linh@clinicpro.com')), 2, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.linh@clinicpro.com')), 3, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.linh@clinicpro.com')), 4, true),
    ((SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.linh@clinicpro.com')), 5, true);

-- Insert standard time slots for ALL schedules (morning + afternoon)
-- Morning: 08:00 - 11:30 (7 slots, 30-min each)
-- Afternoon: 13:30 - 16:30 (7 slots, 30-min each)
INSERT INTO time_slots (schedule_id, start_time, end_time, max_patients, is_available)
SELECT ws.id, slot.start_time, slot.end_time, 1, true
FROM working_schedules ws
CROSS JOIN (
    VALUES
        ('08:00'::time, '08:30'::time),
        ('08:30'::time, '09:00'::time),
        ('09:00'::time, '09:30'::time),
        ('09:30'::time, '10:00'::time),
        ('10:00'::time, '10:30'::time),
        ('10:30'::time, '11:00'::time),
        ('11:00'::time, '11:30'::time),
        ('13:30'::time, '14:00'::time),
        ('14:00'::time, '14:30'::time),
        ('14:30'::time, '15:00'::time),
        ('15:00'::time, '15:30'::time),
        ('15:30'::time, '16:00'::time),
        ('16:00'::time, '16:30'::time),
        ('16:30'::time, '17:00'::time)
) AS slot(start_time, end_time);

-- ====================================================
-- 4. ADD MORE APPOINTMENTS (various statuses)
-- ====================================================

-- Past completed appointment for patient Hoa with Doctor Minh
INSERT INTO appointments (id, patient_id, doctor_id, specialty_id, appointment_date, appointment_time, status, symptoms, notes) VALUES
    (gen_random_uuid(),
     (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.hoa@gmail.com')),
     (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.minh@clinicpro.com')),
     (SELECT id FROM specialties WHERE name = 'Nội khoa'),
     CURRENT_DATE - INTERVAL '14' DAY, '08:30:00', 'COMPLETED',
     'Ho kéo dài, khó thở nhẹ',
     'Bệnh nhân cần theo dõi thêm');

-- Past completed appointment for patient An with Doctor Thảo
INSERT INTO appointments (id, patient_id, doctor_id, specialty_id, appointment_date, appointment_time, status, symptoms, notes) VALUES
    (gen_random_uuid(),
     (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.an@gmail.com')),
     (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.thao@clinicpro.com')),
     (SELECT id FROM specialties WHERE name = 'Thần kinh'),
     CURRENT_DATE - INTERVAL '10' DAY, '10:00:00', 'COMPLETED',
     'Đau đầu thường xuyên, chóng mặt',
     'Cần chụp MRI não');

-- Past completed appointment for patient Tuấn with Doctor Linh
INSERT INTO appointments (id, patient_id, doctor_id, specialty_id, appointment_date, appointment_time, status, symptoms, notes) VALUES
    (gen_random_uuid(),
     (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.tuan@gmail.com')),
     (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.linh@clinicpro.com')),
     (SELECT id FROM specialties WHERE name = 'Mắt'),
     CURRENT_DATE - INTERVAL '5' DAY, '14:00:00', 'COMPLETED',
     'Mờ mắt, nhìn không rõ ban đêm',
     'Kiểm tra thị lực định kỳ');

-- Future confirmed appointment for patient Tuấn
INSERT INTO appointments (id, patient_id, doctor_id, specialty_id, appointment_date, appointment_time, status, symptoms) VALUES
    (gen_random_uuid(),
     (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.tuan@gmail.com')),
     (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.minh@clinicpro.com')),
     (SELECT id FROM specialties WHERE name = 'Nội khoa'),
     CURRENT_DATE + INTERVAL '3' DAY, '09:00:00', 'CONFIRMED',
     'Tái khám nội khoa tổng quát');

-- Future pending appointment for patient Hoa
INSERT INTO appointments (id, patient_id, doctor_id, specialty_id, appointment_date, appointment_time, status, symptoms) VALUES
    (gen_random_uuid(),
     (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.hoa@gmail.com')),
     (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.nam@clinicpro.com')),
     (SELECT id FROM specialties WHERE name = 'Da liễu'),
     CURRENT_DATE + INTERVAL '5' DAY, '14:30:00', 'PENDING',
     'Nổi mẩn đỏ ở cánh tay');

-- ====================================================
-- 5. ADD MORE MEDICAL RECORDS + PRESCRIPTIONS
-- ====================================================

-- Medical record for patient Hoa (Nội khoa completed appointment)
INSERT INTO medical_records (id, appointment_id, patient_id, doctor_id, diagnosis, symptoms, treatment, vital_signs, notes, follow_up_date) VALUES
    (gen_random_uuid(),
     (SELECT a.id FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE u.email = 'benhnhan.hoa@gmail.com' AND a.status = 'COMPLETED'
      ORDER BY a.appointment_date DESC LIMIT 1),
     (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.hoa@gmail.com')),
     (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.minh@clinicpro.com')),
     'Viêm phế quản cấp',
     'Ho khan, đau ngực, khó thở nhẹ khi gắng sức',
     'Kháng sinh, giãn phế quản. Hạn chế tiếp xúc khói bụi.',
     '{"weight": 55, "height": 160, "temp": 37.2, "bp": "110/70", "heart_rate": 82}',
     'Bệnh nhân tiền sử dị ứng phấn hoa. Tái khám sau 7 ngày.',
     CURRENT_DATE + INTERVAL '7' DAY);

-- Prescription for above medical record
INSERT INTO prescriptions (id, medical_record_id, prescription_number, notes, valid_until) VALUES
    (gen_random_uuid(),
     (SELECT mr.id FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE u.email = 'benhnhan.hoa@gmail.com'
      ORDER BY mr.created_at DESC LIMIT 1),
     'RX-2026-001',
     'Uống sau ăn, đủ liệu trình',
     CURRENT_DATE + INTERVAL '14' DAY);

INSERT INTO prescription_details (prescription_id, medicine_id, dosage, frequency, duration, instructions, quantity) VALUES
    ((SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-001'),
     (SELECT id FROM medicines WHERE name = 'Amoxicillin'), '500mg', '3 lần/ngày', '7 ngày', 'Uống sau ăn 30 phút', 21),
    ((SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-001'),
     (SELECT id FROM medicines WHERE name = 'Paracetamol'), '500mg', '2 lần/ngày khi sốt', '5 ngày', 'Uống khi sốt trên 38.5°C', 10);

-- Medical record for patient An (Thần kinh completed appointment)
INSERT INTO medical_records (id, appointment_id, patient_id, doctor_id, diagnosis, symptoms, treatment, vital_signs, notes, follow_up_date) VALUES
    (gen_random_uuid(),
     (SELECT a.id FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE u.email = 'benhnhan.an@gmail.com' AND a.status = 'COMPLETED'
      ORDER BY a.appointment_date DESC LIMIT 1),
     (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.an@gmail.com')),
     (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.thao@clinicpro.com')),
     'Đau nửa đầu (Migraine)',
     'Đau đầu dữ dội một bên, buồn nôn, nhạy cảm với ánh sáng',
     'Thuốc giảm đau, thay đổi lối sống, hạn chế stress',
     '{"weight": 72, "height": 170, "temp": 36.5, "bp": "125/85", "heart_rate": 76}',
     'Cần chụp MRI não nếu cơn đau tăng tần suất. Tái khám sau 2 tuần.',
     CURRENT_DATE + INTERVAL '14' DAY);

INSERT INTO prescriptions (id, medical_record_id, prescription_number, notes, valid_until) VALUES
    (gen_random_uuid(),
     (SELECT mr.id FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE u.email = 'benhnhan.an@gmail.com'
      ORDER BY mr.created_at DESC LIMIT 1),
     'RX-2026-002',
     'Uống đúng liều, tránh tự ý ngưng thuốc',
     CURRENT_DATE + INTERVAL '30' DAY);

INSERT INTO prescription_details (prescription_id, medicine_id, dosage, frequency, duration, instructions, quantity) VALUES
    ((SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-002'),
     (SELECT id FROM medicines WHERE name = 'Ibuprofen'), '400mg', '2 lần/ngày khi đau', '10 ngày', 'Uống sau ăn', 20),
    ((SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-002'),
     (SELECT id FROM medicines WHERE name = 'Omeprazole'), '20mg', '1 lần/ngày sáng', '10 ngày', 'Uống trước ăn 30 phút (bảo vệ dạ dày)', 10);

-- Medical record for patient Tuấn (Mắt completed appointment)
INSERT INTO medical_records (id, appointment_id, patient_id, doctor_id, diagnosis, symptoms, treatment, vital_signs, notes) VALUES
    (gen_random_uuid(),
     (SELECT a.id FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE u.email = 'benhnhan.tuan@gmail.com' AND du.email = 'doctor.linh@clinicpro.com' AND a.status = 'COMPLETED'
      LIMIT 1),
     (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.tuan@gmail.com')),
     (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.linh@clinicpro.com')),
     'Cận thị nhẹ (Myopia -1.5D)',
     'Mờ mắt khi nhìn xa, mỏi mắt khi sử dụng máy tính lâu',
     'Kê toa kính, hạn chế sử dụng thiết bị điện tử >2h liên tục',
     '{"visual_acuity_right": "20/40", "visual_acuity_left": "20/30", "iop_right": 14, "iop_left": 15}',
     'Tái khám sau 6 tháng để kiểm tra tiến triển');

-- Add prescription for existing V7 medical record (Rối loạn nhịp tim nhẹ)
INSERT INTO prescriptions (id, medical_record_id, prescription_number, notes, valid_until) VALUES
    (gen_random_uuid(),
     (SELECT mr.id FROM medical_records mr WHERE mr.diagnosis = 'Rối loạn nhịp tim nhẹ' LIMIT 1),
     'RX-2026-000',
     'Uống đều đặn, không bỏ liều',
     CURRENT_DATE + INTERVAL '30' DAY);

INSERT INTO prescription_details (prescription_id, medicine_id, dosage, frequency, duration, instructions, quantity) VALUES
    ((SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-000'),
     (SELECT id FROM medicines WHERE name = 'Metformin'), '500mg', '1 lần/ngày tối', '30 ngày', 'Uống sau bữa tối', 30),
    ((SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-000'),
     (SELECT id FROM medicines WHERE name = 'Vitamin C'), '1000mg', '1 lần/ngày sáng', '30 ngày', 'Uống sau bữa sáng', 30);

-- ====================================================
-- 6. ADD MORE MEDICINES (commonly used)
-- ====================================================
INSERT INTO medicines (name, generic_name, dosage_form, strength, manufacturer) VALUES
    ('Cetirizine', 'Cetirizine', 'TABLET', '10mg', 'Pharma VN'),
    ('Loratadine', 'Loratadine', 'TABLET', '10mg', 'Pharma VN'),
    ('Prednisolone', 'Prednisolone', 'TABLET', '5mg', 'Pharma VN'),
    ('Salbutamol', 'Salbutamol', 'INHALER', '100mcg', 'GlaxoSmithKline'),
    ('Azithromycin', 'Azithromycin', 'TABLET', '250mg', 'Pharma VN'),
    ('Domperidone', 'Domperidone', 'TABLET', '10mg', 'Pharma VN'),
    ('Loperamide', 'Loperamide', 'CAPSULE', '2mg', 'Pharma VN'),
    ('Amlodipine', 'Amlodipine', 'TABLET', '5mg', 'Pharma VN'),
    ('Lisinopril', 'Lisinopril', 'TABLET', '10mg', 'Pharma VN'),
    ('Diazepam', 'Diazepam', 'TABLET', '5mg', 'Pharma VN');

-- ====================================================
-- 7. ADD MORE REVIEWS
-- ====================================================
INSERT INTO reviews (id, patient_id, doctor_id, appointment_id, rating, comment) VALUES
    -- Patient Hoa reviews Doctor Minh
    (gen_random_uuid(),
     (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.hoa@gmail.com')),
     (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.minh@clinicpro.com')),
     (SELECT a.id FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE u.email = 'benhnhan.hoa@gmail.com' AND a.status = 'COMPLETED'
      ORDER BY a.appointment_date DESC LIMIT 1),
     5, 'Bác sĩ rất tận tâm, giải thích rõ ràng về tình trạng bệnh.'),

    -- Patient An reviews Doctor Thảo
    (gen_random_uuid(),
     (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.an@gmail.com')),
     (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.thao@clinicpro.com')),
     (SELECT a.id FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE u.email = 'benhnhan.an@gmail.com' AND a.status = 'COMPLETED'
      ORDER BY a.appointment_date DESC LIMIT 1),
     4, 'Khám kỹ lưỡng, tuy nhiên thời gian chờ hơi lâu.'),

    -- Patient Tuấn reviews Doctor Linh
    (gen_random_uuid(),
     (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.tuan@gmail.com')),
     (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.linh@clinicpro.com')),
     (SELECT a.id FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE u.email = 'benhnhan.tuan@gmail.com' AND du.email = 'doctor.linh@clinicpro.com' AND a.status = 'COMPLETED'
      LIMIT 1),
     5, 'Bác sĩ chuyên nghiệp, thiết bị hiện đại. Rất hài lòng!');

-- ====================================================
-- 8. ADD PAYMENTS for new completed appointments
-- ====================================================
INSERT INTO payments (id, appointment_id, patient_id, amount, payment_method, status, paid_at)
SELECT gen_random_uuid(), a.id, a.patient_id,
    CASE
        WHEN d.consultation_fee IS NOT NULL THEN d.consultation_fee
        ELSE 300000
    END,
    'CASH', 'COMPLETED', a.appointment_date + TIME '17:00'
FROM appointments a
JOIN doctors d ON a.doctor_id = d.id
WHERE a.status = 'COMPLETED'
AND a.id NOT IN (SELECT appointment_id FROM payments WHERE appointment_id IS NOT NULL);
