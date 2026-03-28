package com.soc.service;

import com.soc.model.ThreatIntelligence;
import com.soc.repository.ThreatIntelligenceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class ThreatIntelligenceService {
    
    @Autowired
    private ThreatIntelligenceRepository threatIntelligenceRepository;
    
    public List<ThreatIntelligence> getAllIndicators() {
        return threatIntelligenceRepository.findAll();
    }
    
    public List<ThreatIntelligence> getActiveIndicators() {
        return threatIntelligenceRepository.findByIsActiveTrue();
    }
    
    public List<ThreatIntelligence> getHighConfidenceIndicators(int minConfidence) {
        return threatIntelligenceRepository.findHighConfidenceIndicators(minConfidence);
    }
    
    public ThreatIntelligence getIndicatorById(Long id) {
        return threatIntelligenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Threat intelligence not found"));
    }
    
    public ThreatIntelligence getIndicatorByValue(String indicator) {
        return threatIntelligenceRepository.findByIndicator(indicator)
                .orElseThrow(() -> new RuntimeException("Indicator not found"));
    }
    
    @Transactional
    public ThreatIntelligence createIndicator(ThreatIntelligence indicator) {
        indicator.setFirstSeen(LocalDateTime.now());
        indicator.setIsActive(true);
        ThreatIntelligence saved = threatIntelligenceRepository.save(indicator);
        log.info("Created new threat indicator: {}", saved.getIndicator());
        return saved;
    }
    
    @Transactional
    public ThreatIntelligence updateIndicator(Long id, ThreatIntelligence indicatorDetails) {
        ThreatIntelligence indicator = threatIntelligenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Threat intelligence not found"));
        
        indicator.setIndicator(indicatorDetails.getIndicator());
        indicator.setIndicatorType(indicatorDetails.getIndicatorType());
        indicator.setThreatType(indicatorDetails.getThreatType());
        indicator.setConfidenceScore(indicatorDetails.getConfidenceScore());
        indicator.setSource(indicatorDetails.getSource());
        indicator.setDescription(indicatorDetails.getDescription());
        indicator.setLastSeen(LocalDateTime.now());
        indicator.setIsActive(indicatorDetails.getIsActive());
        
        ThreatIntelligence updated = threatIntelligenceRepository.save(indicator);
        log.info("Updated threat indicator: {}", updated.getIndicator());
        return updated;
    }
    
    @Transactional
    public void deleteIndicator(Long id) {
        ThreatIntelligence indicator = threatIntelligenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Threat intelligence not found"));
        threatIntelligenceRepository.delete(indicator);
        log.info("Deleted threat indicator: {}", indicator.getIndicator());
    }
    
    public long countActiveIndicators() {
        return threatIntelligenceRepository.countActiveIndicators();
    }
}
