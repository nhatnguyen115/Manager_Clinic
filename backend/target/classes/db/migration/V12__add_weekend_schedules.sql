-- =====================================================
-- V12__add_weekend_schedules.sql
-- Add Saturday (6) and Sunday (0) schedules for all doctors
-- =====================================================

-- 1. Add Working Schedules for all existing doctors for Sat (6) and Sun (0)
-- Avoid duplicates if some already exist
INSERT INTO working_schedules (doctor_id, day_of_week, is_available)
SELECT d.id, days.day, true
FROM doctors d
CROSS JOIN (VALUES (6), (0)) AS days(day)
ON CONFLICT (doctor_id, day_of_week, specific_date) DO NOTHING;

-- 2. Add Time Slots for these new weekend schedules
-- Standard 14 slots per day
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
) AS slot(start_time, end_time)
WHERE ws.day_of_week IN (6, 0)
AND NOT EXISTS (
    SELECT 1 FROM time_slots ts 
    WHERE ts.schedule_id = ws.id 
    AND ts.start_time = slot.start_time
);
