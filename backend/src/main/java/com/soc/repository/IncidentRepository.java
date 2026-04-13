package com.soc.repository;

import com.soc.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    Optional<Incident> findByIncidentId(String incidentId);
    
    List<Incident> findByStatus(Incident.Status status);
    
    List<Incident> findBySeverity(Incident.Severity severity);
    
    @Query("SELECT i FROM Incident i WHERE i.status != 'CLOSED' ORDER BY i.createdAt DESC")
    List<Incident> findActiveIncidents();
    
    @Query("SELECT COUNT(i) FROM Incident i WHERE i.status = 'OPEN'")
    long countOpenIncidents();
    
    @Query("SELECT COUNT(i) FROM Incident i WHERE i.severity = 'CRITICAL'")
    long countCriticalIncidents();
    
    @Query("SELECT COUNT(i) FROM Incident i WHERE i.resolvedAt >= :startOfDay")
    long countResolvedToday(LocalDateTime startOfDay);
    
    @Query("SELECT i.severity, COUNT(i) FROM Incident i GROUP BY i.severity")
    List<Object[]> countBySeverity();
    
    @Query("SELECT i.status, COUNT(i) FROM Incident i GROUP BY i.status")
    List<Object[]> countByStatus();
    
    @Query("SELECT i.incidentType, COUNT(i) FROM Incident i GROUP BY i.incidentType")
    List<Object[]> countByType();
    
    @Query("SELECT DATE(i.createdAt), COUNT(i) FROM Incident i WHERE i.createdAt >= :startDate GROUP BY DATE(i.createdAt)")
    List<Object[]> countByDate(LocalDateTime startDate);

    List<Incident> findByCreatedAtAfter(LocalDateTime dateTime);
    
    @Query("SELECT COUNT(i) FROM Incident i WHERE i.createdAt > :since")
    long countByCreatedAtAfter(@Param("since") LocalDateTime since);

        /**
     * Find the last incident ID for a specific year to determine the next sequence number
     * @param year the year to search for
     * @return the last incident ID (e.g., "INC-2026-0034") or null if none exists
     */
    @Query("SELECT i.incidentId FROM Incident i WHERE i.incidentId LIKE CONCAT('INC-', :year, '-%') ORDER BY i.incidentId DESC LIMIT 1")
    String findLastIncidentIdForYear(@Param("year") int year);
}
