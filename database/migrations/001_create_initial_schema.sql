
BEGIN;

-- ==========================================
-- USERS TABLE
-- ==========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL
        CHECK (char_length(trim(name)) > 0),

    email VARCHAR(255) NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive unique email constraint.
CREATE UNIQUE INDEX users_email_lower_unique
ON users (LOWER(email));


-- ==========================================
-- READINGS TABLE
-- ==========================================

CREATE TABLE readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    reading_date DATE NOT NULL,

    slot VARCHAR(30) NOT NULL
        CHECK (
            slot IN (
                'morning',
                'after_breakfast',
                'after_lunch',
                'after_dinner'
            )
        ),

    value INTEGER NOT NULL
        CHECK (value BETWEEN 40 AND 600),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_reading_slot
        UNIQUE (user_id, reading_date, slot)
);


-- ==========================================
-- INDEXES FOR REPORT QUERIES
-- ==========================================

CREATE INDEX idx_readings_user_date
ON readings (user_id, reading_date);


COMMIT;

