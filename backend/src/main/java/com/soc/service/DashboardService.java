package com.soc.service;

import com.soc.controller.DashboardController;
import com.soc.model.Alert;
import com.soc.model.Incident;
import com.soc.repository.AlertRepository;
import com.soc.repository.IncidentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class DashboardService {
    
    @Autowired
    private IncidentRepository incidentRepository;
    
    @Autowired
    private AlertRepository alertRepository;
    
    public DashboardController.DashboardUpdates checkForUpdates() {
        DashboardController.DashboardUpdates updates = new DashboardController.DashboardUpdates();
        
        LocalDateTime thirtySecondsAgo = LocalDateTime.now().minusSeconds(30);
        
        List<Incident> recentIncidents = incidentRepository.findByCreatedAtAfter(thirtySecondsAgo);
        if (!recentIncidents.isEmpty()) {
            updates.setHasNewIncidents(true);
            updates.setNewIncidentTitle(recentIncidents.get(0).getTitle());
        }
        
        List<Alert> recentAlerts = alertRepository.findByCreatedAtAfter(thirtySecondsAgo);
        if (!recentAlerts.isEmpty()) {
            updates.setHasNewAlerts(true);
            updates.setNewAlertName(recentAlerts.get(0).getAlertName());
        }
        
        return updates;
    }
}