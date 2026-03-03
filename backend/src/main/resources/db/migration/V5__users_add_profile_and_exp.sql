-- Extend users with profile and gamification fields
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '學員',
  ADD COLUMN IF NOT EXISTS exp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT now();

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_users_exp_desc ON users (exp DESC, id);
