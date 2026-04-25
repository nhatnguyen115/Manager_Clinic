-- =====================================================
-- V8__create_password_reset_token_table.sql
-- Table for password reset functionality
-- =====================================================

CREATE TABLE password_reset_tokens (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token           VARCHAR(255) NOT NULL UNIQUE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expiry_date     TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
