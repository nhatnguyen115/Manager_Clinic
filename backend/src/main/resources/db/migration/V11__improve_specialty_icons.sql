-- =====================================================
-- V11__improve_specialty_icons.sql
-- Update specialties with more specific Lucide icons
-- =====================================================

UPDATE specialties SET icon = 'Ear'   WHERE name = 'Tai mũi họng';
UPDATE specialties SET icon = 'Smile' WHERE name = 'Răng hàm mặt';
UPDATE specialties SET icon = 'Pill'  WHERE name = 'Da liễu';
