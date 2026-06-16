-- V5__Create_Guardian_Acknowledgements.sql

CREATE TABLE guardian_acknowledgements (
    id BINARY(16) PRIMARY KEY,
    escalation_id BINARY(16) NOT NULL,
    guardian_id BINARY(16) NOT NULL,
    ack_time TIMESTAMP(6) NOT NULL,
    ack_type VARCHAR(50),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_ga_escalation FOREIGN KEY (escalation_id) REFERENCES journey_escalation_records(id)
);

CREATE INDEX idx_ga_escalation ON guardian_acknowledgements(escalation_id);
