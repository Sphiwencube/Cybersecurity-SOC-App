package com.soc.controller;

import com.soc.model.ThreatIntelligence;
import com.soc.service.ThreatIntelligenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/threat-intel")
@CrossOrigin(origins = "*")
@Slf4j
public class ThreatIntelligenceController {
    
    @Autowired
    private ThreatIntelligenceService threatIntelligenceService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<List<ThreatIntelligence>> getAllIndicators() {
        return ResponseEntity.ok(threatIntelligenceService.getAllIndicators());
    }
    
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<List<ThreatIntelligence>> getActiveIndicators() {
        return ResponseEntity.ok(threatIntelligenceService.getActiveIndicators());
    }
    
    @GetMapping("/high-confidence")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<List<ThreatIntelligence>> getHighConfidenceIndicators(
            @RequestParam(defaultValue = "80") int minConfidence) {
        return ResponseEntity.ok(threatIntelligenceService.getHighConfidenceIndicators(minConfidence));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<ThreatIntelligence> getIndicatorById(@PathVariable Long id) {
        return ResponseEntity.ok(threatIntelligenceService.getIndicatorById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public ResponseEntity<ThreatIntelligence> createIndicator(@RequestBody ThreatIntelligence indicator) {
        log.info("Creating new threat indicator: {}", indicator.getIndicator());
        return ResponseEntity.ok(threatIntelligenceService.createIndicator(indicator));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public ResponseEntity<ThreatIntelligence> updateIndicator(@PathVariable Long id, @RequestBody ThreatIntelligence indicator) {
        log.info("Updating threat indicator: {}", id);
        return ResponseEntity.ok(threatIntelligenceService.updateIndicator(id, indicator));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteIndicator(@PathVariable Long id) {
        log.info("Deleting threat indicator: {}", id);
        threatIntelligenceService.deleteIndicator(id);
        return ResponseEntity.ok("Threat indicator deleted successfully");
    }
    
    @GetMapping("/stats/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<Map<String, Long>> getActiveIndicatorsCount() {
        return ResponseEntity.ok(Map.of("count", threatIntelligenceService.countActiveIndicators()));
    }
}
