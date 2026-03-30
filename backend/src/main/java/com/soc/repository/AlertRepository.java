package com.soc.repository;

import com.soc.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByCreatedAtAfter(LocalDateTime since);
    
    List<Alert> findByStatus(Alert.Status status);
    
    List<Alert> findBySeverity(Alert.Severity severity);
    
    @Query("SELECT a FROM Alert a WHERE a.status = 'NEW' ORDER BY a.createdAt DESC")
    List<Alert> findNewAlerts();
    
    @Query("SELECT a FROM Alert a WHERE a.status = 'ACKNOWLEDGED' ORDER BY a.acknowledgedAt DESC")
    List<Alert> findAcknowledgedAlerts();
    
    @Query("SELECT a FROM Alert a WHERE a.status = 'RESOLVED' ORDER BY a.resolvedAt DESC")
    List<Alert> findResolvedAlerts();
    
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.severity = 'CRITICAL' AND a.status = 'NEW'")
    long countCriticalAlerts();
    
    @Query("SELECT a.severity, COUNT(a) FROM Alert a GROUP BY a.severity")
    List<Object[]> countBySeverity();
    
    @Query("SELECT a.status, COUNT(a) FROM Alert a GROUP BY a.status")
    List<Object[]> countByStatus();
    
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.createdAt > :since")
    long countByCreatedAtAfter(@Param("since") LocalDateTime since);
}