-- V4__Create_Journey_Event_Audit.sql

CREATE TABLE journey_event_audit (
    event_id BINARY(16) PRIMARY KEY,
    journey_id BINARY(16) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload_json TEXT,
    processed_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_jea_journey FOREIGN KEY (journey_id) REFERENCES safe_journey_sessions(id)
);

CREATE INDEX idx_jea_journey ON journey_event_audit(journey_id);
