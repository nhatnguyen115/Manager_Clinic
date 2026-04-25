-- =====================================================
-- V4__create_medical_record_tables.sql
-- Medical records and prescriptions
-- =====================================================

-- =====================================================
-- MEDICINES TABLE
-- =====================================================
CREATE TABLE medicines (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(200) NOT NULL,
    generic_name        VARCHAR(200),
    dosage_form         VARCHAR(50),
    strength            VARCHAR(50),
    manufacturer        VARCHAR(200),
    description         TEXT,
    side_effects        TEXT,
    contraindications   TEXT,
    is_prescription     BOOLEAN DEFAULT true,
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medicines_name ON medicines(name);

-- Insert some common medicines
INSERT INTO medicines (name, generic_name, dosage_form, strength, manufacturer) VALUES
    ('Paracetamol', 'Acetaminophen', 'TABLET', '500mg', 'Pharma VN'),
    ('Amoxicillin', 'Amoxicillin', 'CAPSULE', '500mg', 'Pharma VN'),
    ('Ibuprofen', 'Ibuprofen', 'TABLET', '400mg', 'Pharma VN'),
    ('Omeprazole', 'Omeprazole', 'CAPSULE', '20mg', 'Pharma VN'),
    ('Metformin', 'Metformin', 'TABLET', '500mg', 'Pharma VN'),
    ('Vitamin C', 'Ascorbic Acid', 'TABLET', '1000mg', 'Pharma VN');

-- =====================================================
-- MEDICAL RECORDS TABLE
-- =====================================================
CREATE TABLE medical_records (
    id                  UUID DEFAULT random_uuid() PRIMARY KEY,
    appointment_id      UUID UNIQUE REFERENCES appointments(id),
    patient_id          UUID NOT NULL REFERENCES patients(id),
    doctor_id           UUID NOT NULL REFERENCES doctors(id),
    diagnosis           TEXT NOT NULL,
    symptoms            TEXT,
    vital_signs         JSON,
    treatment           TEXT,
    notes               TEXT,
    follow_up_date      DATE,
    attachments         JSON,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id);

-- =====================================================
-- PRESCRIPTIONS TABLE
-- =====================================================
CREATE TABLE prescriptions (
    id                  UUID DEFAULT random_uuid() PRIMARY KEY,
    medical_record_id   UUID UNIQUE REFERENCES medical_records(id) ON DELETE CASCADE,
    prescription_number VARCHAR(50) UNIQUE,
    notes               TEXT,
    valid_until         DATE,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PRESCRIPTION DETAILS TABLE
-- =====================================================
CREATE TABLE prescription_details (
    id                  SERIAL PRIMARY KEY,
    prescription_id     UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id         INTEGER NOT NULL REFERENCES medicines(id),
    dosage              VARCHAR(100) NOT NULL,
    frequency           VARCHAR(100) NOT NULL,
    duration            VARCHAR(100),
    instructions        TEXT,
    quantity            INTEGER NOT NULL,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prescription_details_prescription ON prescription_details(prescription_id);
