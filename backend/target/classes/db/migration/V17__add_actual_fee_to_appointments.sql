-- Migration: V17__add_actual_fee_to_appointments.sql
-- Description: Store the final doctor-entered consultation fee per appointment

ALTER TABLE appointments
ADD COLUMN actual_fee DECIMAL(15,2);
