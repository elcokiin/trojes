-- Fix existing ideas with empty created_at/updated_at
UPDATE ideas
SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE created_at = '' OR created_at IS NULL;

UPDATE ideas
SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE updated_at = '' OR updated_at IS NULL;

-- Fix users with empty timestamps
UPDATE users
SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE created_at = '' OR created_at IS NULL;

UPDATE users
SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE updated_at = '' OR updated_at IS NULL;

-- Fix accounts with empty timestamps
UPDATE accounts
SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE created_at = '' OR created_at IS NULL;

UPDATE accounts
SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE updated_at = '' OR updated_at IS NULL;

-- Fix api_keys with empty created_at
UPDATE api_keys
SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE created_at = '' OR created_at IS NULL;
