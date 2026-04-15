package com.soc.controller;

import com.soc.model.Alert;
import com.soc.service.AlertService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
@Slf4j
public class AlertController {
    
    @Autowired
    private AlertService alertService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }
    
    @GetMapping("/new")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<List<Alert>> getNewAlerts() {
        return ResponseEntity.ok(alertService.getNewAlerts());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<Alert> getAlertById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public ResponseEntity<Alert> createAlert(@RequestBody Alert alert) {
        log.info("Creating new alert: {}", alert.getAlertName());
        return ResponseEntity.ok(alertService.createAlert(alert));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public ResponseEntity<Alert> updateAlert(@PathVariable Long id, @RequestBody Alert alert) {
        log.info("Updating alert: {}", id);
        return ResponseEntity.ok(alertService.updateAlert(id, alert));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAlert(@PathVariable Long id) {
        log.info("Deleting alert: {}", id);
        alertService.deleteAlert(id);
        return ResponseEntity.ok("Alert deleted successfully");
    }
    
    // ACKNOWLEDGE ALERT
    @PostMapping("/{id}/acknowledge")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public ResponseEntity<Alert> acknowledgeAlert(@PathVariable Long id) {
        log.info("Acknowledging alert: {}", id);
        Alert alert = alertService.acknowledgeAlert(id);
        return ResponseEntity.ok(alert);
    }
    
    // RESOLVE ALERT
    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public ResponseEntity<Alert> resolveAlert(@PathVariable Long id) {
        log.info("Resolving alert: {}", id);
        Alert alert = alertService.resolveAlert(id);
        return ResponseEntity.ok(alert);
    }
    
    @GetMapping("/stats/critical")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<Map<String, Long>> getCriticalAlertsCount() {
        return ResponseEntity.ok(Map.of("count", alertService.countCriticalAlerts()));
    }
}
