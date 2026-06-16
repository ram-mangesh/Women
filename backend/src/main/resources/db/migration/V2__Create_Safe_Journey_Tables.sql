-- V2__Create_Safe_Journey_Tables.sql

CREATE TABLE safe_journey_sessions (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    source_lat DOUBLE NOT NULL,
    source_lng DOUBLE NOT NULL,
    destination_lat DOUBLE NOT NULL,
    destination_lng DOUBLE NOT NULL,
    source_label VARCHAR(300),
    destination_label VARCHAR(300),
    start_time TIMESTAMP(6) NOT NULL,
    expected_arrival_time TIMESTAMP(6) NOT NULL,
    expected_duration_min INT NOT NULL,
    completed_at TIMESTAMP(6),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_known_lat DOUBLE,
    last_known_lng DOUBLE,
    last_heartbeat_time TIMESTAMP(6),
    distance_to_dest_m DOUBLE,
    missed_checkpoints INT NOT NULL DEFAULT 0,
    total_checkpoints INT NOT NULL DEFAULT 0,
    stopped_since TIMESTAMP(6),
    suspicious_stop_score INT NOT NULL DEFAULT 0,
    escalation_level INT NOT NULL DEFAULT 0,
    guardian_alerted_at TIMESTAMP(6),
    police_alerted_at TIMESTAMP(6),
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_sjs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sjs_user ON safe_journey_sessions(user_id);
CREATE INDEX idx_sjs_status ON safe_journey_sessions(status);
CREATE INDEX idx_sjs_arrival ON safe_journey_sessions(expected_arrival_time);

CREATE TABLE journey_checkpoints (
    id BINARY(16) PRIMARY KEY,
    journey_id BINARY(16) NOT NULL,
    checkpoint_minute INT NOT NULL,
    scheduled_at TIMESTAMP(6) NOT NULL,
    response_window_sec INT NOT NULL DEFAULT 60,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    response_action VARCHAR(20),
    responded_at TIMESTAMP(6),
    notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
    notification_sent_at TIMESTAMP(6),
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_jcp_journey FOREIGN KEY (journey_id) REFERENCES safe_journey_sessions(id)
);

CREATE INDEX idx_jcp_journey ON journey_checkpoints(journey_id);
CREATE INDEX idx_jcp_scheduled ON journey_checkpoints(scheduled_at, status);

CREATE TABLE journey_stop_events (
    id BINARY(16) PRIMARY KEY,
    journey_id BINARY(16) NOT NULL,
    started_at TIMESTAMP(6) NOT NULL,
    ended_at TIMESTAMP(6),
    duration_sec INT,
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    stop_score INT NOT NULL,
    action_taken VARCHAR(100),
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_jse_journey FOREIGN KEY (journey_id) REFERENCES safe_journey_sessions(id)
);

CREATE INDEX idx_jse_journey ON journey_stop_events(journey_id);
