-- =====================================================
-- V13__add_more_medical_history_for_hoa.sql
-- Add 2 more completed appointments and medical records for patient Hoa
-- to test medical history list and pagination.
-- =====================================================

-- 1. Get IDs for patient Hoa and Doctor Thảo
DO $$
DECLARE
    patient_hoa_id UUID := (SELECT id FROM patients WHERE user_id = (SELECT id FROM users WHERE email = 'benhnhan.hoa@gmail.com'));
    doctor_thao_id UUID := (SELECT id FROM doctors WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.thao@clinicpro.com'));
    specialty_nhi_id UUID := (SELECT id FROM specialties WHERE name = 'Nhi khoa');
    apt_id_1 UUID := gen_random_uuid();
    apt_id_2 UUID := gen_random_uuid();
    record_id_1 UUID := gen_random_uuid();
    record_id_2 UUID := gen_random_uuid();
    presc_id_1 UUID := gen_random_uuid();
    presc_id_2 UUID := gen_random_uuid();
BEGIN
    -- Appointment 1: 1 month ago
    INSERT INTO appointments (id, patient_id, doctor_id, specialty_id, appointment_date, appointment_time, status, symptoms, completed_at)
    VALUES (apt_id_1, patient_hoa_id, doctor_thao_id, specialty_nhi_id, CURRENT_DATE - INTERVAL '30' DAY, '08:00:00', 'COMPLETED', 'Sốt nhẹ, sổ mũi', CURRENT_TIMESTAMP - INTERVAL '30' DAY);

    -- Medical Record 1
    INSERT INTO medical_records (id, appointment_id, patient_id, doctor_id, diagnosis, symptoms, treatment, vital_signs, notes)
    VALUES (record_id_1, apt_id_1, patient_hoa_id, doctor_thao_id, 'Cảm cúm thông thường', 'Sốt 38 độ, hắt hơi, sổ mũi liên tục', 'Nghỉ ngơi, uống nhiều nước, hạ sốt khi cần', '{"temperature": "38.0", "weight": "54"}', 'Theo dõi sát thân nhiệt');

    -- Prescription 1
    INSERT INTO prescriptions (id, medical_record_id, prescription_number, notes, valid_until)
    VALUES (presc_id_1, record_id_1, 'RX-HOA-001', 'Uống sau ăn', CURRENT_DATE - INTERVAL '15' DAY);

    INSERT INTO prescription_details (prescription_id, medicine_id, dosage, frequency, duration, instructions, quantity)
    VALUES (presc_id_1, (SELECT id FROM medicines WHERE name = 'Paracetamol' LIMIT 1), '500mg', '2 lần/ngày', '3 ngày', 'Chỉ uống khi sốt > 38.5', 6);

    -- Appointment 2: 2 months ago
    INSERT INTO appointments (id, patient_id, doctor_id, specialty_id, appointment_date, appointment_time, status, symptoms, completed_at)
    VALUES (apt_id_2, patient_hoa_id, doctor_thao_id, specialty_nhi_id, CURRENT_DATE - INTERVAL '60' DAY, '10:00:00', 'COMPLETED', 'Đau họng, nuốt đau', CURRENT_TIMESTAMP - INTERVAL '60' DAY);

    -- Medical Record 2
    INSERT INTO medical_records (id, appointment_id, patient_id, doctor_id, diagnosis, symptoms, treatment, vital_signs)
    VALUES (record_id_2, apt_id_2, patient_hoa_id, doctor_thao_id, 'Viêm họng cấp', 'Họng đỏ, amidan sưng nhẹ', 'Súc miệng nước muối, kháng sinh', '{"temperature": "37.5"}');

    -- Prescription 2
    INSERT INTO prescriptions (id, medical_record_id, prescription_number, notes, valid_until)
    VALUES (presc_id_2, record_id_2, 'RX-HOA-002', 'Uống đủ liều 5 ngày', CURRENT_DATE - INTERVAL '50' DAY);

    INSERT INTO prescription_details (prescription_id, medicine_id, dosage, frequency, duration, instructions, quantity)
    VALUES (presc_id_2, (SELECT id FROM medicines WHERE name = 'Amoxicillin' LIMIT 1), '500mg', '3 lần/ngày', '5 ngày', 'Uống cách nhau 8 tiếng', 15);

END $$;
