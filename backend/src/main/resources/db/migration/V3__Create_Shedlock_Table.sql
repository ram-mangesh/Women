-- V3__Create_Shedlock_Table.sql

CREATE TABLE shedlock (
    name VARCHAR(64) NOT NULL,
    lock_until TIMESTAMP(3) NOT NULL,
    locked_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    locked_by VARCHAR(255) NOT NULL,
    PRIMARY KEY (name)
);

CREATE TABLE journey_escalation_records (
    id BINARY(16) PRIMARY KEY,
    journey_id BINARY(16) NOT NULL,
    trigger_reason VARCHAR(255) NOT NULL,
    escalation_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_jer_journey FOREIGN KEY (journey_id) REFERENCES safe_journey_sessions(id)
);

CREATE INDEX idx_jer_journey ON journey_escalation_records(journey_id);
