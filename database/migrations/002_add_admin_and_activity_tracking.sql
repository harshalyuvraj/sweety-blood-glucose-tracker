BEGIN;

-- ==========================================
-- ADMINISTRATOR AND USER ACTIVITY FIELDS
-- ==========================================

ALTER TABLE users
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN last_active_at TIMESTAMPTZ;


-- ==========================================
-- USER ACTIVITY LOGS
-- ==========================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    event_type VARCHAR(50) NOT NULL
        CHECK (
            event_type IN (
                'user_registered',
                'user_logged_in',
                'reading_created',
                'reading_updated',
                'reading_deleted',
                'report_viewed'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==========================================
-- INDEXES FOR ADMIN DASHBOARD QUERIES
-- ==========================================

CREATE INDEX idx_activity_logs_created_at
ON activity_logs (created_at DESC);

CREATE INDEX idx_activity_logs_user_created
ON activity_logs (user_id, created_at DESC);

CREATE INDEX idx_users_last_active
ON users (last_active_at DESC);


COMMIT;