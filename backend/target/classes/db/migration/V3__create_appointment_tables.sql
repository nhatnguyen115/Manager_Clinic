-- =====================================================
-- V3__create_appointment_tables.sql
-- Appointment management tables
-- =====================================================

-- =====================================================
-- WORKING SCHEDULES TABLE
-- =====================================================
CREATE TABLE working_schedules (
    id              SERIAL PRIMARY KEY,
    doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week     INTEGER NOT NULL,
    specific_date   DATE,
    is_available    BOOLEAN DEFAULT true,
    notes           VARCHAR(255),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(doctor_id, day_of_week, specific_date)
);

CREATE INDEX idx_working_schedules_doctor ON working_schedules(doctor_id);

-- =====================================================
-- TIME SLOTS TABLE
-- =====================================================
CREATE TABLE time_slots (
    id              SERIAL PRIMARY KEY,
    schedule_id     INTEGER REFERENCES working_schedules(id) ON DELETE CASCADE,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    max_patients    INTEGER DEFAULT 1,
    is_available    BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_time_slots_schedule ON time_slots(schedule_id);

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE appointments (
    id                  UUID DEFAULT random_uuid() PRIMARY KEY,
    patient_id          UUID NOT NULL REFERENCES patients(id),
    doctor_id           UUID NOT NULL REFERENCES doctors(id),
    specialty_id        UUID REFERENCES specialties(id),
    time_slot_id        INTEGER REFERENCES time_slots(id),
    appointment_date    DATE NOT NULL,
    appointment_time    TIME NOT NULL,
    status              VARCHAR(20) DEFAULT 'PENDING',
    symptoms            TEXT,
    notes               TEXT,
    cancelled_by        UUID REFERENCES users(id),
    cancelled_reason    TEXT,
    confirmed_at        TIMESTAMP,
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Unique constraint: No double booking for same doctor, date, time
CREATE UNIQUE INDEX idx_unique_appointment 
ON appointments(doctor_id, appointment_date, appointment_time);
