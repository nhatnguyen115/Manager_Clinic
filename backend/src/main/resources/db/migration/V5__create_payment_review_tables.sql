-- =====================================================
-- V5__create_payment_review_tables.sql
-- Payments, invoices, and reviews
-- =====================================================

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id      UUID REFERENCES appointments(id),
    patient_id          UUID NOT NULL REFERENCES patients(id),
    amount              DECIMAL(15,2) NOT NULL,
    payment_method      VARCHAR(20) NOT NULL,
    status              VARCHAR(20) DEFAULT 'PENDING',
    transaction_id      VARCHAR(100),
    vnpay_response      JSON,
    paid_at             TIMESTAMP,
    refunded_at         TIMESTAMP,
    refund_amount       DECIMAL(15,2),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_status ON payments(status);

-- =====================================================
-- INVOICES TABLE
-- =====================================================
CREATE TABLE invoices (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_id          UUID UNIQUE REFERENCES payments(id),
    invoice_number      VARCHAR(50) UNIQUE NOT NULL,
    items               JSONB NOT NULL,
    subtotal            DECIMAL(15,2) NOT NULL,
    tax_rate            DECIMAL(5,2) DEFAULT 0,
    tax_amount          DECIMAL(15,2) DEFAULT 0,
    total               DECIMAL(15,2) NOT NULL,
    issued_at           TIMESTAMP DEFAULT NOW(),
    pdf_url             VARCHAR(500),
    created_at          TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id          UUID NOT NULL REFERENCES patients(id),
    doctor_id           UUID NOT NULL REFERENCES doctors(id),
    appointment_id      UUID UNIQUE REFERENCES appointments(id),
    rating              INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment             TEXT,
    is_anonymous        BOOLEAN DEFAULT false,
    is_visible          BOOLEAN DEFAULT true,
    admin_response      TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_doctor ON reviews(doctor_id);
CREATE INDEX idx_reviews_patient ON reviews(patient_id);
