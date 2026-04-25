-- =====================================================
-- V10__add_missing_doctors.sql
-- Add doctors for specialties that currently have none:
--   - Cơ xương khớp
--   - Tai mũi họng
--   - Răng hàm mặt
--   - Sản phụ khoa
-- =====================================================

-- 1. Create User accounts for new doctors
-- Password: Password123
INSERT INTO users (id, email, password_hash, full_name, phone, role_id, is_active, email_verified) VALUES
    (gen_random_uuid(), 'doctor.son@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Trịnh Văn Sơn', '0912123123', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true),
    (gen_random_uuid(), 'doctor.ha@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Đỗ Thu Hà', '0913123123', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true),
    (gen_random_uuid(), 'doctor.quan@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Ngô Minh Quân', '0914123123', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true),
    (gen_random_uuid(), 'doctor.anh@clinicpro.com', '$2b$12$6mT1XNqMrJbHnL0OoOv54OG5D34b2M84h3p0TB6DZvpphfFGNbu.q', 'Nguyễn Phương Anh', '0915123123', (SELECT id FROM roles WHERE name = 'DOCTOR'), true, true);

-- 2. Create Doctor profiles
INSERT INTO doctors (id, user_id, specialty_id, experience_years, consultation_fee, bio, license_number, education, certifications, avg_rating, total_reviews) VALUES
    -- Cơ xương khớp
    (gen_random_uuid(),
     (SELECT id FROM users WHERE email = 'doctor.son@clinicpro.com'),
     (SELECT id FROM specialties WHERE name = 'Cơ xương khớp'),
     15, 500000,
     'Chuyên gia chấn thương chỉnh hình và cơ xương khớp với hơn 15 năm kinh nghiệm điều trị các bệnh lý cột sống.',
     'BS-CXK-007',
     ARRAY['Đại học Y Hà Nội - 2009', 'Thạc sĩ Chấn thương chỉnh hình - 2014'],
     ARRAY['Chứng chỉ phẫu thuật nội soi khớp', 'Hội viên Hội Chấn thương chỉnh hình Việt Nam'],
     4.8, 42),

    -- Tai mũi họng
    (gen_random_uuid(),
     (SELECT id FROM users WHERE email = 'doctor.ha@clinicpro.com'),
     (SELECT id FROM specialties WHERE name = 'Tai mũi họng'),
     10, 350000,
     'Bác sĩ chuyên khoa Tai Mũi Họng, chuyên điều trị viêm xoang, viêm họng hạt và các bệnh lý thính lực.',
     'BS-TMH-008',
     ARRAY['Đại học Y Dược Thái Nguyên - 2014', 'Chuyên khoa I - Tai Mũi Họng - 2018'],
     ARRAY['Chứng chỉ nội soi Tai Mũi Họng'],
     4.6, 28),

    -- Răng hàm mặt
    (gen_random_uuid(),
     (SELECT id FROM users WHERE email = 'doctor.quan@clinicpro.com'),
     (SELECT id FROM specialties WHERE name = 'Răng hàm mặt'),
     7, 400000,
     'Bác sĩ Răng Hàm Mặt chuyên sâu về thẩm mỹ nha khoa, niềng răng và cấy ghép Implant.',
     'BS-RHM-009',
     ARRAY['Đại học Y Hà Nội - 2016', 'Chứng chỉ chỉnh nha nâng cao - 2020'],
     ARRAY['Chứng chỉ cấy ghép Implant quốc tế'],
     4.9, 15),

    -- Sản phụ khoa
    (gen_random_uuid(),
     (SELECT id FROM users WHERE email = 'doctor.anh@clinicpro.com'),
     (SELECT id FROM specialties WHERE name = 'Sản phụ khoa'),
     12, 450000,
     'Bác sĩ giàu kinh nghiệm trong quản lý thai kỳ, chăm sóc sức khỏe phụ nữ và điều trị vô sinh hiếm muộn.',
     'BS-SPK-010',
     ARRAY['Đại học Y Dược TP.HCM - 2012', 'Thạc sĩ Sản phụ khoa - 2017'],
     ARRAY['Chứng chỉ siêu âm sản phụ khoa', 'Hội viên Hội Sản phụ khoa Việt Nam'],
     4.7, 53);

-- 3. Add Working Schedules (Mon-Fri) for new doctors
INSERT INTO working_schedules (doctor_id, day_of_week, is_available)
SELECT d.id, day, true
FROM doctors d
CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS days(day)
WHERE d.license_number IN ('BS-CXK-007', 'BS-TMH-008', 'BS-RHM-009', 'BS-SPK-010');

-- 4. Add Time Slots for the new schedules
INSERT INTO time_slots (schedule_id, start_time, end_time, max_patients, is_available)
SELECT ws.id, slot.start_time, slot.end_time, 1, true
FROM working_schedules ws
JOIN doctors d ON ws.doctor_id = d.id
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
) AS slot(start_time, end_time)
WHERE d.license_number IN ('BS-CXK-007', 'BS-TMH-008', 'BS-RHM-009', 'BS-SPK-010');
