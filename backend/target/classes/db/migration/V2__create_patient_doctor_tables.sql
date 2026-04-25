-- =====================================================
-- V2__create_patient_doctor_tables.sql
-- Patient and Doctor profile tables
-- =====================================================

-- =====================================================
-- PATIENTS TABLE
-- =====================================================
CREATE TABLE patients (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth           DATE,
    gender                  VARCHAR(10),
    address                 TEXT,
    city                    VARCHAR(100),
    blood_type              VARCHAR(5),
    allergies               TEXT[],
    chronic_diseases        TEXT[],
    emergency_contact_name  VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    insurance_number        VARCHAR(50),
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_patients_user ON patients(user_id);

-- =====================================================
-- DOCTORS TABLE
-- =====================================================
CREATE TABLE doctors (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialty_id        UUID REFERENCES specialties(id),
    bio                 TEXT,
    experience_years    INTEGER,
    license_number      VARCHAR(50),
    education           TEXT[],
    certifications      TEXT[],
    avg_rating          DECIMAL(2,1) DEFAULT 0,
    total_reviews       INTEGER DEFAULT 0,
    consultation_fee    DECIMAL(12,2),
    is_available        BOOLEAN DEFAULT true,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doctors_specialty ON doctors(specialty_id);
CREATE INDEX idx_doctors_rating ON doctors(avg_rating DESC);
CREATE INDEX idx_doctors_user ON doctors(user_id);
