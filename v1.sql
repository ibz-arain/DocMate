CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    email_verified BOOLEAN NOT NULL DEFAULT 0,
    phone_verified BOOLEAN NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    plan_type VARCHAR(20) NOT NULL DEFAULT 'free',
    plan_limits INTEGER,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at DATE NOT NULL DEFAULT CURRENT_DATE
);
CREATE UNIQUE INDEX idx_users_email ON users(email);


CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  confidence REAL NOT NULL,
  content_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  tables TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE api_endpoints (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    template_id TEXT,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('POST', 'GET')),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
    api_key TEXT NOT NULL,
    -- Settings fields
    auth_enabled BOOLEAN NOT NULL DEFAULT true,
    rate_limit_enabled BOOLEAN NOT NULL DEFAULT true,
    rate_limit_requests INTEGER,
    rate_limit_period TEXT CHECK (rate_limit_period IN ('second', 'minute', 'hour', 'day')),
    webhook_url TEXT,
    webhook_events TEXT, -- Store as JSON array
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
);

CREATE TABLE api_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (endpoint_id) REFERENCES api_endpoints(id) ON DELETE CASCADE
);

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

CREATE TABLE plan_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    period_start DATE NOT NULL, -- Start of the billing period (e.g., 2024-01-01)
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'monthly')),
    api_calls_count INTEGER NOT NULL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, period_start, period_type)
);

-- Documents indexes (most important queries)
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_user_type ON documents(user_id, type);

-- Templates indexes (unique constraint per user)
CREATE UNIQUE INDEX idx_templates_user_name ON templates(user_id, name);

-- API Endpoints indexes
CREATE INDEX idx_api_endpoints_user ON api_endpoints(user_id);
CREATE INDEX idx_api_usage_endpoint_timestamp ON api_usage(endpoint_id, timestamp);

-- New indexes for usage tracking
CREATE INDEX idx_user_usage_user_timestamp ON user_usage(user_id, timestamp);
CREATE INDEX idx_user_usage_endpoint ON user_usage(endpoint_name);
CREATE INDEX idx_plan_usage_user_period ON plan_usage(user_id, period_start, period_type);