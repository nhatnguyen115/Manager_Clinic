-- Migration to add common profile fields to doctors table
ALTER TABLE doctors
ADD COLUMN date_of_birth DATE,
ADD COLUMN gender VARCHAR(10),
ADD COLUMN address TEXT,
ADD COLUMN city VARCHAR(100);

-- Update existing doctors if needed (optional, just ensuring columns exist)
