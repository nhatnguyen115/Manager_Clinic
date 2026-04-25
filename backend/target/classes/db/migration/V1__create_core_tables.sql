-- =====================================================
-- V1__create_core_tables.sql
-- Core tables: roles, users, specialties
-- =====================================================

-- Enable UUID extension (Commented for H2 compatibility in tests)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ROLES TABLE
-- =====================================================
CREATE TABLE roles (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    permissions     JSON DEFAULT '[]',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('PATIENT', 'Bệnh nhân - Đặt lịch khám, xem hồ sơ'),
    ('DOCTOR', 'Bác sĩ - Quản lý lịch khám, tạo bệnh án'),
    ('ADMIN', 'Quản trị viên - Toàn quyền'),
    ('RECEPTIONIST', 'Lễ tân - Hỗ trợ đặt lịch');

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id              UUID DEFAULT random_uuid() PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),
    role_id         INTEGER REFERENCES roles(id),
    is_active       BOOLEAN DEFAULT true,
    email_verified  BOOLEAN DEFAULT false,
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- =====================================================
-- SPECIALTIES TABLE
-- =====================================================
CREATE TABLE specialties (
    id              UUID DEFAULT random_uuid() PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    icon            VARCHAR(100),
    is_active       BOOLEAN DEFAULT true,
    display_order   INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Insert default specialties
INSERT INTO specialties (name, description, icon, display_order) VALUES
    ('Nội khoa', 'Khám và điều trị các bệnh nội khoa', 'stethoscope', 1),
    ('Nhi khoa', 'Khám và điều trị cho trẻ em', 'baby', 2),
    ('Da liễu', 'Các bệnh về da', 'scan', 3),
    ('Tim mạch', 'Các bệnh về tim và mạch máu', 'heart', 4),
    ('Thần kinh', 'Các bệnh về hệ thần kinh', 'brain', 5),
    ('Cơ xương khớp', 'Các bệnh về xương khớp', 'bone', 6),
    ('Tai mũi họng', 'Các bệnh về tai, mũi, họng', 'ear', 7),
    ('Răng hàm mặt', 'Các bệnh về răng miệng', 'smile', 8),
    ('Sản phụ khoa', 'Khám sản và phụ khoa', 'baby', 9),
    ('Mắt', 'Các bệnh về mắt', 'eye', 10);
