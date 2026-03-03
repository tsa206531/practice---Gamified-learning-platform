-- Align courses.id type with JPA (Long -> BIGINT)
ALTER TABLE courses
  ALTER COLUMN id TYPE BIGINT USING id::BIGINT;