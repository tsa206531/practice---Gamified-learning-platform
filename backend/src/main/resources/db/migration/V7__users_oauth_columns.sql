-- OAuth support columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS provider VARCHAR(50),
  ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS avatar VARCHAR(512);

-- Optional: you can enforce uniqueness later when confident
-- CREATE UNIQUE INDEX IF NOT EXISTS ux_users_provider_provider_id ON users(provider, provider_id);
