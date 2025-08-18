CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    plan_type VARCHAR(20),
    plan_limits INTEGER,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- CREATE TABLE templates (
--   id TEXT PRIMARY KEY,
--   user_id INTEGER NOT NULL,
--   name TEXT NOT NULL,
--   tables TEXT NOT NULL,
--   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
-- );

-- CREATE TABLE api_endpoints (
--     id TEXT PRIMARY KEY,
--     user_id INTEGER NOT NULL,
--     template_id TEXT,
--     name TEXT NOT NULL,
--     path TEXT NOT NULL,
--     method TEXT NOT NULL CHECK (method IN ('POST', 'GET')),
--     status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
--     api_key TEXT NOT NULL,
--     -- Settings fields
--     auth_enabled BOOLEAN NOT NULL DEFAULT true,
--     rate_limit_enabled BOOLEAN NOT NULL DEFAULT true,
--     rate_limit_requests INTEGER,
--     rate_limit_period TEXT CHECK (rate_limit_period IN ('second', 'minute', 'hour', 'day')),
--     webhook_url TEXT,
--     webhook_events TEXT, -- Store as JSON array
--     -- Timestamps
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     last_used DATETIME,
--     FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
--     FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
-- );

-- CREATE TABLE api_usage (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     endpoint_id TEXT NOT NULL,
--     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
--     status_code INTEGER NOT NULL,
--     response_time_ms INTEGER NOT NULL,
--     request_size_bytes INTEGER,
--     response_size_bytes INTEGER,
--     ip_address TEXT,
--     user_agent TEXT,
--     FOREIGN KEY (endpoint_id) REFERENCES api_endpoints(id) ON DELETE CASCADE
-- );

-- New tables for API usage tracking
CREATE TABLE user_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    endpoint_name TEXT NOT NULL, -- 'chat', 'analyze', etc.
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    input_description TEXT, -- Stores user input description (chat message or analysis type)
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Plan management tables
CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_name TEXT NOT NULL CHECK (plan_name IN ('free', 'pro', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT 0,
    canceled_at DATETIME,
    trial_start DATE,
    trial_end DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE subscription_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id INTEGER NOT NULL,
    old_plan_name TEXT CHECK (old_plan_name IN ('free', 'pro', 'enterprise')),
    new_plan_name TEXT NOT NULL CHECK (new_plan_name IN ('free', 'pro', 'enterprise')),
    change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'cancel', 'reactivate')),
    effective_date DATE NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    payment_method TEXT, -- 'stripe', 'paypal', etc.
    external_payment_id TEXT, -- ID from payment processor
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE TABLE plan_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    year_month TEXT NOT NULL, -- Format: '2024-01'
    api_calls_count INTEGER NOT NULL DEFAULT 0,
    storage_used_mb INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, year_month)
);

-- Plan limits (hardcoded in application)
-- Free: 100 API calls/month, 1GB storage
-- Pro: 10,000 API calls/month, 10GB storage  
-- Enterprise: 100,000 API calls/month, 100GB storage
