package com.soc.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "alert_type")
    private String alertType;

    @Column(name = "source_ip")
    private String sourceIp;

    @Column(name = "alert_name", nullable = false)
    private String alertName;
    
    @Enumerated(EnumType.STRING)
    private Severity severity = Severity.MEDIUM;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.NEW;
    
    private String source;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "related_incident_id")
    private Incident relatedIncident;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_data", columnDefinition = "json")
    private Map<String, Object> rawData;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;
    
    @Column(name = "acknowledged_by")
    private Long acknowledgedBy;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    public enum Severity {
        CRITICAL, HIGH, MEDIUM, LOW, INFO
    }
    
    public enum Status {
        NEW, ACKNOWLEDGED, RESOLVED, FALSE_POSITIVE
    }
}