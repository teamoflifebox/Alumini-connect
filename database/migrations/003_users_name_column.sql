-- Store full display name alongside first_name / last_name

ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);

UPDATE users
SET name = TRIM(CONCAT(first_name, ' ', last_name))
WHERE name IS NULL OR name = '';
