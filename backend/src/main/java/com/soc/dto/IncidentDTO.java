package com.soc.dto;

import com.soc.model.Incident;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class IncidentDTO {
    private Long id;
    private String incidentId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    private Incident.Severity severity;
    private Incident.Status status;
    private String incidentType;
    private String sourceIp;
    private String destinationIp;
    private String attackVector;
    private String malwareFamily;
    private String affectedAssets;
    private Long assignedToId;
    private String assignedToName;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    
    public static IncidentDTO fromEntity(Incident incident) {
        IncidentDTO dto = new IncidentDTO();
        dto.setId(incident.getId());
        dto.setIncidentId(incident.getIncidentId());
        dto.setTitle(incident.getTitle());
        dto.setDescription(incident.getDescription());
        dto.setSeverity(incident.getSeverity());
        dto.setStatus(incident.getStatus());
        dto.setIncidentType(incident.getIncidentType());
        dto.setSourceIp(incident.getSourceIp());
        dto.setDestinationIp(incident.getDestinationIp());
        dto.setAttackVector(incident.getAttackVector());
        dto.setMalwareFamily(incident.getMalwareFamily());
        dto.setAffectedAssets(incident.getAffectedAssets());
        
        if (incident.getAssignedTo() != null) {
            dto.setAssignedToId(incident.getAssignedTo().getId());
            dto.setAssignedToName(incident.getAssignedTo().getFirstName() + " " + incident.getAssignedTo().getLastName());
        }
        
        if (incident.getCreatedBy() != null) {
            dto.setCreatedById(incident.getCreatedBy().getId());
            dto.setCreatedByName(incident.getCreatedBy().getFirstName() + " " + incident.getCreatedBy().getLastName());
        }
        
        dto.setCreatedAt(incident.getCreatedAt());
        dto.setUpdatedAt(incident.getUpdatedAt());
        dto.setResolvedAt(incident.getResolvedAt());
        
        return dto;
    }
}
