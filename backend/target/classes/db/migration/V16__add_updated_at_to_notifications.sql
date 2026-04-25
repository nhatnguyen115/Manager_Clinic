-- Migration: V16__add_updated_at_to_notifications.sql
-- Description: Add missing updated_at column to notifications table

ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
