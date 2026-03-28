package com.soc.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "threat_intelligence")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThreatIntelligence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String indicator;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "indicator_type", nullable = false)
    private IndicatorType indicatorType;
    
    @Column(name = "threat_type")
    private String threatType;
    
    @Column(name = "confidence_score")
    private Integer confidenceScore;
    
    private String source;
    
    @Column(name = "first_seen")
    private LocalDateTime firstSeen;
    
    @Column(name = "last_seen")
    private LocalDateTime lastSeen;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    public enum IndicatorType {
        IP, DOMAIN, URL, HASH, EMAIL
    }
}
