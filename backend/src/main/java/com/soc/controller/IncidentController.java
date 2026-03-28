package com.soc.controller;

import com.soc.dto.DashboardStats;
import com.soc.dto.IncidentDTO;
import com.soc.service.IncidentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
@Slf4j
public class IncidentController {
    
    @Autowired
    private IncidentService incidentService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<List<IncidentDTO>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }
    
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<List<IncidentDTO>> getActiveIncidents() {
        return ResponseEntity.ok(incidentService.getActiveIncidents());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<IncidentDTO> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public ResponseEntity<IncidentDTO> createIncident(@RequestBody IncidentDTO incidentDTO) {
        log.info("Creating new incident: {}", incidentDTO.getTitle());
        return ResponseEntity.ok(incidentService.createIncident(incidentDTO));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public ResponseEntity<IncidentDTO> updateIncident(@PathVariable Long id, @RequestBody IncidentDTO incidentDTO) {
        log.info("Updating incident: {}", id);
        return ResponseEntity.ok(incidentService.updateIncident(id, incidentDTO));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteIncident(@PathVariable Long id) {
        log.info("Deleting incident: {}", id);
        incidentService.deleteIncident(id);
        return ResponseEntity.ok("Incident deleted successfully");
    }
    
    @GetMapping("/stats/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(incidentService.getDashboardStats());
    }
}
