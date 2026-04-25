-- Migration: V15__create_notifications_table.sql
-- Description: Create notifications table for in-app messaging and alerts

CREATE TABLE notifications (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    message             TEXT NOT NULL,
    type                VARCHAR(50) NOT NULL, -- APPOINTMENT, PAYMENT, SYSTEM, REMINDER
    is_read             BOOLEAN DEFAULT false,
    related_entity_type VARCHAR(50),          -- APPOINTMENT, INVOICE
    related_entity_id   UUID,                 -- ID của appointment hoặc invoice tương ứng
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
