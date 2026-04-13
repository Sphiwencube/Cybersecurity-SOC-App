package com.soc.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
//import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;


@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "incident_id", unique = true, nullable = false, updatable = false, length = 50)
    //@UuidGenerator
    private String incidentId;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    private Severity severity = Severity.MEDIUM;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;
    
    @Column(name = "incident_type")
    private String incidentType;
    
    @Column(name = "source_ip")
    private String sourceIp;
    
    @Column(name = "destination_ip")
    private String destinationIp;
    
    @Column(name = "attack_vector")
    private String attackVector;
    
    @Column(name = "malware_family")
    private String malwareFamily;
    
    @Column(name = "affected_assets", columnDefinition = "TEXT")
    private String affectedAssets;
    
    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;
    
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;


    @PrePersist
    public void prePersist() {
        if (this.incidentId == null) {
            // Fallback: generate a timestamp-based ID if not set by service
            this.incidentId = "INC-" + java.time.Year.now().getValue() + "-" + 
                             String.format("%04d", (int)(Math.random() * 9999) + 1);
        }
    }
    
    public enum Severity {
        CRITICAL, HIGH, MEDIUM, LOW, INFO
    }
    
    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED
    }
}
