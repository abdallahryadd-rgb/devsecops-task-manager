-- Migration: Add priority, due_date, tags to tasks, and create activity_logs table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags VARCHAR(50)[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL, -- e.g. 'task_created', 'task_updated', 'task_completed', 'task_reopened', 'task_deleted'
    task_id INTEGER,
    task_title VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
