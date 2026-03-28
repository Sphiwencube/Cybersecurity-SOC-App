package com.soc.repository;

import com.soc.model.ThreatIntelligence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ThreatIntelligenceRepository extends JpaRepository<ThreatIntelligence, Long> {
    Optional<ThreatIntelligence> findByIndicator(String indicator);
    
    List<ThreatIntelligence> findByIndicatorType(ThreatIntelligence.IndicatorType type);
    
    List<ThreatIntelligence> findByIsActiveTrue();
    
    @Query("SELECT t FROM ThreatIntelligence t WHERE t.confidenceScore >= :minConfidence ORDER BY t.confidenceScore DESC")
    List<ThreatIntelligence> findHighConfidenceIndicators(int minConfidence);
    
    @Query("SELECT COUNT(t) FROM ThreatIntelligence t WHERE t.isActive = true")
    long countActiveIndicators();
}
