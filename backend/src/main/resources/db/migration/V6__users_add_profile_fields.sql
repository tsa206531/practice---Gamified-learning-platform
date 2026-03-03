-- Add additional profile fields to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS occupation VARCHAR(255),
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
  ADD COLUMN IF NOT EXISTS location VARCHAR(255);
