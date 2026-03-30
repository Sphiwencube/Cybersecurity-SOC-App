package com.soc.controller;

import com.soc.service.DashboardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
@Slf4j
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;
    
    @GetMapping("/updates")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<DashboardUpdates> checkForUpdates() {
        DashboardUpdates updates = dashboardService.checkForUpdates();
        return ResponseEntity.ok(updates);
    }
    
    public static class DashboardUpdates {
        private boolean hasNewIncidents;
        private boolean hasNewAlerts;
        private String newIncidentTitle;
        private String newAlertName;
        
        public boolean isHasNewIncidents() {
            return hasNewIncidents;
        }
        
        public void setHasNewIncidents(boolean hasNewIncidents) {
            this.hasNewIncidents = hasNewIncidents;
        }
        
        public boolean isHasNewAlerts() {
            return hasNewAlerts;
        }
        
        public void setHasNewAlerts(boolean hasNewAlerts) {
            this.hasNewAlerts = hasNewAlerts;
        }
        
        public String getNewIncidentTitle() {
            return newIncidentTitle;
        }
        
        public void setNewIncidentTitle(String newIncidentTitle) {
            this.newIncidentTitle = newIncidentTitle;
        }
        
        public String getNewAlertName() {
            return newAlertName;
        }
        
        public void setNewAlertName(String newAlertName) {
            this.newAlertName = newAlertName;
        }
    }
}