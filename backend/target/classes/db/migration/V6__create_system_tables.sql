-- =====================================================
-- V6__create_system_tables.sql
-- News, audit logs, refresh tokens
-- =====================================================

-- =====================================================
-- NEWS TABLE
-- =====================================================
CREATE TABLE news (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) UNIQUE,
    content             TEXT NOT NULL,
    excerpt             TEXT,
    thumbnail_url       VARCHAR(500),
    author_id           UUID REFERENCES users(id),
    category            VARCHAR(50),
    is_published        BOOLEAN DEFAULT false,
    is_featured         BOOLEAN DEFAULT false,
    view_count          INTEGER DEFAULT 0,
    published_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_news_published ON news(is_published, published_at DESC);
CREATE INDEX idx_news_slug ON news(slug);

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       VARCHAR(100),
    old_value       JSON,
    new_value       JSON,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- =====================================================
-- REFRESH TOKENS TABLE
-- =====================================================
CREATE TABLE refresh_tokens (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(500) NOT NULL UNIQUE,
    device_info     VARCHAR(255),
    ip_address      VARCHAR(45),
    expires_at      TIMESTAMP NOT NULL,
    revoked_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
