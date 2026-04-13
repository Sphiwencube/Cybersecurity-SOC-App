package com.soc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentForecast {
    
    private List<DailyForecast> dailyForecasts;
    private TrendAnalysis trendAnalysis;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyForecast {
        private String day;          
        private String date;          
        private int predictedCount;   
        private int actualCount;      
        private double confidence;    // 0-100%
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrendAnalysis {
        private String trendDirection;  // "INCREASING", "DECREASING", "STABLE"
        private double changePercent;     // % change from previous period
        private String peakDay;         // Day with highest predicted incidents
        private int totalPredicted;     // Sum of all predicted incidents
    }
}