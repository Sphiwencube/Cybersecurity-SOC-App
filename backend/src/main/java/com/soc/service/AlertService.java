package com.soc.service;

import com.soc.model.Alert;
import com.soc.repository.AlertRepository;
import com.soc.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AlertService {
    
    @Autowired
    private AlertRepository alertRepository;
    
    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }
    
    public List<Alert> getNewAlerts() {
        return alertRepository.findNewAlerts();
    }
    
    public Alert getAlertById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
    }
    
    @Transactional
    public Alert createAlert(Alert alert) {
        alert.setStatus(Alert.Status.NEW);
        Alert savedAlert = alertRepository.save(alert);
        log.info("Created new alert: {}", savedAlert.getAlertName());
        return savedAlert;
    }
    
    @Transactional
    public Alert updateAlert(Long id, Alert alertDetails) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        
        alert.setAlertName(alertDetails.getAlertName());
        alert.setSeverity(alertDetails.getSeverity());
        alert.setDescription(alertDetails.getDescription());
        alert.setSource(alertDetails.getSource());
        
        Alert.Status oldStatus = alert.getStatus();
        alert.setStatus(alertDetails.getStatus());
        
        if (alertDetails.getStatus() == Alert.Status.ACKNOWLEDGED && oldStatus != Alert.Status.ACKNOWLEDGED) {
            alert.setAcknowledgedAt(LocalDateTime.now());
        }
        
        if (alertDetails.getStatus() == Alert.Status.RESOLVED && oldStatus != Alert.Status.RESOLVED) {
            alert.setResolvedAt(LocalDateTime.now());
        }
        
        Alert updatedAlert = alertRepository.save(alert);
        log.info("Updated alert: {}", updatedAlert.getAlertName());
        return updatedAlert;
    }
    
    @Transactional
    public Alert acknowledgeAlert(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        
        if (alert.getStatus() == Alert.Status.ACKNOWLEDGED) {
            return alert; // Already acknowledged
        }
        
        alert.setStatus(Alert.Status.ACKNOWLEDGED);
        alert.setAcknowledgedAt(LocalDateTime.now());
        
        // Get current user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            alert.setAcknowledgedBy(userDetails.getId());
        }
        
        Alert updatedAlert = alertRepository.save(alert);
        log.info("Alert {} acknowledged", id);
        return updatedAlert;
    }
    
    @Transactional
    public Alert resolveAlert(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        
        alert.setStatus(Alert.Status.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        
        Alert updatedAlert = alertRepository.save(alert);
        log.info("Alert {} resolved", id);
        return updatedAlert;
    }
    
    @Transactional
    public void deleteAlert(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alertRepository.delete(alert);
        log.info("Deleted alert: {}", alert.getAlertName());
    }
    
    public long countCriticalAlerts() {
        return alertRepository.countCriticalAlerts();
    }
    
    public Map<String, Long> getAlertsBySeverity() {
        return alertRepository.countBySeverity().stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (Long) row[1]
                ));
    }
}
