package com.soc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalIncidents;
    private long openIncidents;
    private long criticalAlerts;
    private long resolvedToday;
    private long threatIndicators;
    private Map<String, Long> incidentsBySeverity;
    private Map<String, Long> incidentsByStatus;
    private Map<String, Long> incidentsByType;
    private List<IncidentTrend> incidentTrends;
    private List<RecentActivity> recentActivities;

    private PredictiveMetrics predictiveMetrics;
    
    @Data
    @AllArgsConstructor
    public static class IncidentTrend {
        private String date;
        private long count;
    }
    
    @Data
    @AllArgsConstructor
    public static class RecentActivity {
        private String type;
        private String description;
        private String timestamp;
        private String severity;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PredictiveMetrics {
        private double threatPredictionAccuracy;
        private double falsePositiveRate;
        private double modelConfidence;
        private double avgResolutionTime;
        private double incidentGrowthRate;
    }
}