package com.soc.service;

import com.soc.dto.DashboardStats;
import com.soc.dto.IncidentDTO;
import com.soc.model.Alert;
import com.soc.model.Incident;
import com.soc.model.User;
import com.soc.repository.AlertRepository;
import com.soc.repository.IncidentRepository;
import com.soc.repository.UserRepository;
import com.soc.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class IncidentService {
    
    @Autowired
    private IncidentRepository incidentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AlertRepository alertRepository;
    
    public List<IncidentDTO> getAllIncidents() {
        return incidentRepository.findAll().stream()
                .map(IncidentDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<IncidentDTO> getActiveIncidents() {
        return incidentRepository.findActiveIncidents().stream()
                .map(IncidentDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public IncidentDTO getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        return IncidentDTO.fromEntity(incident);
    }
    
    @Transactional
    public IncidentDTO createIncident(IncidentDTO incidentDTO) {
        Incident incident = new Incident();
        incident.setIncidentId(generateIncidentId());
        incident.setTitle(incidentDTO.getTitle());
        incident.setDescription(incidentDTO.getDescription());
        incident.setSeverity(incidentDTO.getSeverity());
        incident.setStatus(Incident.Status.OPEN);
        incident.setIncidentType(incidentDTO.getIncidentType());
        incident.setSourceIp(incidentDTO.getSourceIp());
        incident.setDestinationIp(incidentDTO.getDestinationIp());
        incident.setAttackVector(incidentDTO.getAttackVector());
        incident.setMalwareFamily(incidentDTO.getMalwareFamily());
        incident.setAffectedAssets(incidentDTO.getAffectedAssets());
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            incident.setCreatedBy(user);
        }
        
        if (incidentDTO.getAssignedToId() != null) {
            User assignedUser = userRepository.findById(incidentDTO.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            incident.setAssignedTo(assignedUser);
        }
        
        Incident savedIncident = incidentRepository.save(incident);
        log.info("Created new incident: {}", savedIncident.getIncidentId());
        
        return IncidentDTO.fromEntity(savedIncident);
    }

    @Transactional
    public IncidentDTO updateIncident(Long id, IncidentDTO incidentDTO) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        
        incident.setTitle(incidentDTO.getTitle());
        incident.setDescription(incidentDTO.getDescription());
        incident.setSeverity(incidentDTO.getSeverity());
        incident.setStatus(incidentDTO.getStatus());
        incident.setIncidentType(incidentDTO.getIncidentType());
        incident.setSourceIp(incidentDTO.getSourceIp());
        incident.setDestinationIp(incidentDTO.getDestinationIp());
        incident.setAttackVector(incidentDTO.getAttackVector());
        incident.setMalwareFamily(incidentDTO.getMalwareFamily());
        incident.setAffectedAssets(incidentDTO.getAffectedAssets());
        
        if (incidentDTO.getStatus() == Incident.Status.RESOLVED && incident.getResolvedAt() == null) {
            incident.setResolvedAt(LocalDateTime.now());
        }
        
        if (incidentDTO.getAssignedToId() != null) {
            User assignedUser = userRepository.findById(incidentDTO.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            incident.setAssignedTo(assignedUser);
        }
        
        Incident updatedIncident = incidentRepository.save(incident);
        log.info("Updated incident: {}", updatedIncident.getIncidentId());
        
        return IncidentDTO.fromEntity(updatedIncident);
    }

    @Transactional
    public void deleteIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        incidentRepository.delete(incident);
        
        log.info("Deleted incident: {}", incident.getIncidentId());
    }
    
    public DashboardStats getDashboardStats() {
        DashboardStats stats = new DashboardStats();
        
        stats.setTotalIncidents(incidentRepository.count());
        stats.setOpenIncidents(incidentRepository.countOpenIncidents());
        stats.setCriticalAlerts(alertRepository.countCriticalAlerts());
        stats.setResolvedToday(incidentRepository.countResolvedToday(LocalDate.now().atStartOfDay()));
        
        stats.setThreatIndicators(calculateThreatIndicators());
        
        Map<String, Long> bySeverity = new HashMap<>();
        incidentRepository.countBySeverity().forEach(row -> {
            bySeverity.put(row[0].toString(), (Long) row[1]);
        });
        stats.setIncidentsBySeverity(bySeverity);
        
        Map<String, Long> byStatus = new HashMap<>();
        incidentRepository.countByStatus().forEach(row -> {
            byStatus.put(row[0].toString(), (Long) row[1]);
        });
        stats.setIncidentsByStatus(byStatus);
        
        Map<String, Long> byType = new HashMap<>();
        incidentRepository.countByType().forEach(row -> {
            if (row[0] != null) {
                byType.put(row[0].toString(), (Long) row[1]);
            }
        });
        stats.setIncidentsByType(byType);
        
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<DashboardStats.IncidentTrend> trends = incidentRepository.countByDate(weekAgo).stream()
                .map(row -> new DashboardStats.IncidentTrend(
                        row[0].toString(),
                        (Long) row[1]
                ))
                .collect(Collectors.toList());
        stats.setIncidentTrends(trends);
        
        stats.setRecentActivities(getRecentActivities());
        
        return stats;
    }
    
    private long calculateThreatIndicators() {
        long criticalIncidents = incidentRepository.findBySeverity(Incident.Severity.CRITICAL).size();
        long highIncidents = incidentRepository.findBySeverity(Incident.Severity.HIGH).size();
        long newAlerts = alertRepository.findNewAlerts().size();
        
        return criticalIncidents + highIncidents + newAlerts;
    }
    
    private List<DashboardStats.RecentActivity> getRecentActivities() {
        List<DashboardStats.RecentActivity> activities = new ArrayList<>();
        
        List<Incident> recentIncidents = incidentRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());
        
        for (Incident incident : recentIncidents) {
            activities.add(new DashboardStats.RecentActivity(
                "INCIDENT",
                "New incident created: " + incident.getTitle(),
                incident.getCreatedAt().toString(),
                incident.getSeverity().name()
            ));
        }
        
        List<Alert> recentAlerts = alertRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());
        
        for (Alert alert : recentAlerts) {
            activities.add(new DashboardStats.RecentActivity(
                "ALERT",
                "Alert triggered: " + alert.getAlertName(),
                alert.getCreatedAt().toString(),
                alert.getSeverity().name()
            ));
        }
        
        return activities.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(10)
                .collect(Collectors.toList());
    }
    
    private String generateIncidentId() {
        return "INC-" + LocalDate.now().getYear() + "-" + 
               String.format("%04d", incidentRepository.count() + 1);
    }
}