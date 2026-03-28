-- Cybersecurity Incident Intelligence Database Schema

CREATE DATABASE IF NOT EXISTS soc_db;
USE soc_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'ANALYST', 'VIEWER') DEFAULT 'VIEWER',
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO') DEFAULT 'MEDIUM',
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    incident_type VARCHAR(100),
    source_ip VARCHAR(45),
    destination_ip VARCHAR(45),
    attack_vector VARCHAR(100),
    malware_family VARCHAR(100),
    affected_assets TEXT,
    assigned_to BIGINT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Threat Intelligence table
CREATE TABLE IF NOT EXISTS threat_intelligence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    indicator VARCHAR(255) NOT NULL,
    indicator_type ENUM('IP', 'DOMAIN', 'URL', 'HASH', 'EMAIL') NOT NULL,
    threat_type VARCHAR(100),
    confidence_score INT CHECK (confidence_score >= 0 AND confidence_score <= 100),
    source VARCHAR(100),
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_name VARCHAR(255) NOT NULL,
    severity ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO') DEFAULT 'MEDIUM',
    status ENUM('NEW', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_POSITIVE') DEFAULT 'NEW',
    source VARCHAR(100),
    description TEXT,
    related_incident_id BIGINT,
    raw_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    acknowledged_by BIGINT,
    resolved_at TIMESTAMP,
    FOREIGN KEY (related_incident_id) REFERENCES incidents(id),
    FOREIGN KEY (acknowledged_by) REFERENCES users(id)
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI Predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prediction_type VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    input_data JSON,
    prediction_result JSON,
    confidence_score DECIMAL(5,4),
    incident_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id)
);

-- Insert default admin user (password: admin123)
-- BCrypt hash for "admin123" - generated with bcrypt
INSERT INTO users (username, email, password, role, first_name, last_name, avatar_url) 
VALUES ('admin', 'admin@soc.local', '$2b$10$hmOUj2Phvr8wr51OnWFfR.K1sPNWYWO4HXnVovoQKdH.7htbqg5e6', 'ADMIN', 'System', 'Administrator', 'https://ui-avatars.com/api/?name=admin&background=random');

-- Insert sample threat intelligence
INSERT INTO threat_intelligence (indicator, indicator_type, threat_type, confidence_score, source, description) VALUES
('192.168.1.100', 'IP', 'C2 Server', 95, 'ThreatFeed', 'Known command and control server'),
('malicious-domain.com', 'DOMAIN', 'Phishing', 88, 'PhishTank', 'Phishing domain targeting financial institutions'),
('d41d8cd98f00b204e9800998ecf8427e', 'HASH', 'Malware', 92, 'VirusTotal', 'MD5 hash of known malware sample'),
('suspicious@evil.com', 'EMAIL', 'Spam', 75, 'Internal', 'Email address used in phishing campaign');

-- Insert sample incidents
INSERT INTO incidents (incident_id, title, description, severity, status, incident_type, source_ip, destination_ip, attack_vector, created_by) VALUES
('INC-2026-001', 'Ransomware Attack on Finance Dept', 'Detected ransomware activity on finance department workstations', 'CRITICAL', 'OPEN', 'Malware', '10.0.1.50', '10.0.2.100', 'Phishing Email', 1),
('INC-2026-002', 'Suspicious Network Traffic', 'Unusual outbound connections detected from server room', 'HIGH', 'IN_PROGRESS', 'Network Intrusion', '10.0.5.20', '185.220.101.42', 'C2 Communication', 1),
('INC-2026-003', 'Failed Login Attempts', 'Multiple failed login attempts on admin portal', 'MEDIUM', 'RESOLVED', 'Brute Force', '203.0.113.45', '10.0.1.10', 'Credential Stuffing', 1),
('INC-2026-004', 'Data Exfiltration Attempt', 'Large data transfer detected to external IP', 'HIGH', 'OPEN', 'Data Breach', '10.0.3.75', '198.51.100.25', 'Unknown', 1);

-- Insert sample alerts
INSERT INTO alerts (alert_name, severity, status, source, description) VALUES
('Malware Detection Alert', 'CRITICAL', 'NEW', 'EDR', 'Malware signature detected on endpoint'),
('DDoS Attack Detected', 'HIGH', 'ACKNOWLEDGED', 'IDS', 'Potential DDoS attack in progress'),
('Privilege Escalation', 'HIGH', 'NEW', 'SIEM', 'Suspicious privilege escalation detected'),
('Firewall Block', 'LOW', 'RESOLVED', 'Firewall', 'Connection blocked by firewall rule');