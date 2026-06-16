-- ─── V1 ── Initial schema (MySQL) ───

-- ─── USERS ──────────────────────────────────────────────────────────
CREATE TABLE users (
    id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    full_name       VARCHAR(120)        NOT NULL,
    email           VARCHAR(160) UNIQUE NOT NULL,
    phone           VARCHAR(30),
    password_hash   VARCHAR(255)        NOT NULL,
    role            VARCHAR(20)         NOT NULL DEFAULT 'USER',
    avatar_url      VARCHAR(500),
    blood_group     VARCHAR(8),
    medical_info    TEXT,
    device_token    VARCHAR(500),
    stealth_pin     VARCHAR(8),
    is_active       BOOLEAN             NOT NULL DEFAULT TRUE,
    last_seen_at    DATETIME,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- ─── EMERGENCY CONTACTS ─────────────────────────────────────────────
CREATE TABLE emergency_contacts (
    id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id     VARCHAR(36) NOT NULL,
    name        VARCHAR(120) NOT NULL,
    relation    VARCHAR(60),
    phone       VARCHAR(30)  NOT NULL,
    email       VARCHAR(160),
    priority    SMALLINT     NOT NULL DEFAULT 1,
    is_verified BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_ec_user ON emergency_contacts(user_id);

-- ─── GUARDIAN CONNECTIONS (many-to-many) ────────────────────────────
CREATE TABLE guardian_connections (
    id           VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    guardian_id  VARCHAR(36) NOT NULL,
    ward_id      VARCHAR(36) NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (guardian_id, ward_id),
    FOREIGN KEY (guardian_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ward_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── SOS ALERTS ─────────────────────────────────────────────────────
CREATE TABLE sos_alerts (
    id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id         VARCHAR(36) NOT NULL,
    trigger_type    VARCHAR(60)  NOT NULL,
    risk_level      VARCHAR(20)  NOT NULL,
    confidence      DECIMAL(5,2) NOT NULL,
    latitude        DOUBLE NOT NULL,
    longitude       DOUBLE NOT NULL,
    area_name       VARCHAR(200),
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    battery_pct     SMALLINT,
    speed_mps       DECIMAL(6,2),
    heart_rate      SMALLINT,
    escalated_to    VARCHAR(200),
    resolved_at     DATETIME,
    resolved_by     VARCHAR(36),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);
CREATE INDEX idx_sos_user  ON sos_alerts(user_id);
CREATE INDEX idx_sos_stat  ON sos_alerts(status);
CREATE INDEX idx_sos_time  ON sos_alerts(created_at DESC);

-- ─── LIVE LOCATIONS (time-series) ───────────────────────────────────
CREATE TABLE live_locations (
    id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id     VARCHAR(36) NOT NULL,
    latitude    DOUBLE NOT NULL,
    longitude   DOUBLE NOT NULL,
    accuracy    DECIMAL(6,2),
    speed       DECIMAL(6,2),
    heading     DECIMAL(6,2),
    battery_pct SMALLINT,
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_ll_user_time ON live_locations(user_id, recorded_at DESC);

-- ─── INCIDENT REPORTS (community) ───────────────────────────────────
CREATE TABLE incident_reports (
    id              VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reporter_id     VARCHAR(36),
    area_name       VARCHAR(200) NOT NULL,
    latitude        DOUBLE,
    longitude       DOUBLE,
    type            VARCHAR(60)  NOT NULL,
    severity        SMALLINT     NOT NULL CHECK (severity BETWEEN 1 AND 5),
    description     TEXT,
    is_anonymous    BOOLEAN      NOT NULL DEFAULT TRUE,
    verified        BOOLEAN      NOT NULL DEFAULT FALSE,
    verified_by     VARCHAR(36),
    upvotes         INTEGER      NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id)
);
CREATE INDEX idx_ir_area   ON incident_reports(area_name);
CREATE INDEX idx_ir_type   ON incident_reports(type);

-- ─── THREAT SCORES (time-series per user) ───────────────────────────
CREATE TABLE threat_scores (
    id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id     VARCHAR(36) NOT NULL,
    score       DECIMAL(5,2) NOT NULL,
    confidence  DECIMAL(5,2) NOT NULL,
    risk_level  VARCHAR(20)  NOT NULL,
    factors     JSON,
    computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_ts_user_time ON threat_scores(user_id, computed_at DESC);

-- ─── EVIDENCE FILES ─────────────────────────────────────────────────
CREATE TABLE evidence_files (
    id           VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    alert_id     VARCHAR(36),
    user_id      VARCHAR(36) NOT NULL,
    file_type    VARCHAR(20) NOT NULL,
    file_url     VARCHAR(500) NOT NULL,
    mime_type    VARCHAR(80),
    size_bytes   BIGINT,
    sha256       VARCHAR(64),
    uploaded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES sos_alerts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── NOTIFICATIONS ──────────────────────────────────────────────────
CREATE TABLE notifications (
    id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id    VARCHAR(36) NOT NULL,
    title      VARCHAR(200) NOT NULL,
    body       TEXT NOT NULL,
    kind       VARCHAR(20) NOT NULL DEFAULT 'INFO',
    `read`     BOOLEAN NOT NULL DEFAULT FALSE,
    metadata   JSON,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_notif_user ON notifications(user_id, created_at DESC);

-- ─── EMERGENCY LOGS (audit) ─────────────────────────────────────────
CREATE TABLE emergency_logs (
    id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    alert_id    VARCHAR(36),
    actor_id    VARCHAR(36),
    action      VARCHAR(60) NOT NULL,
    channel     VARCHAR(40),
    status      VARCHAR(20) NOT NULL,
    payload     JSON,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES sos_alerts(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id)
);
CREATE INDEX idx_log_alert ON emergency_logs(alert_id);

-- ─── SEED: default admin ───────────────────────────────────────────
INSERT IGNORE INTO users (full_name, email, phone, password_hash, role)
VALUES ('AEGIS Admin', 'admin@aegis.ai', '+10000000000',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN');
