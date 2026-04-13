package com.soc.util;

import com.soc.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Year;

@Component
public class IncidentIdGenerator {

    @Autowired
    private IncidentRepository incidentRepository;

    /**
     * Generates the next sequential incident ID for the current year
     * Format: INC-YYYY-XXXX (e.g., INC-2026-0001)
     * 
     * @return the next available incident ID
     */
    public String generateNextId() {
        int currentYear = Year.now().getValue();
        String yearPrefix = String.format("INC-%d-", currentYear);
        
        // Get the last incident ID for this year from the database
        String lastId = incidentRepository.findLastIncidentIdForYear(currentYear);
        
        int nextNumber = 1;
        if (lastId != null && !lastId.isEmpty()) {
            try {
                // Extract the number part from the last ID (e.g., "INC-2026-0034" -> 34)
                String[] parts = lastId.split("-");
                if (parts.length == 3) {
                    nextNumber = Integer.parseInt(parts[2]) + 1;
                }
            } catch (NumberFormatException e) {
                // If parsing fails, default to 1
                nextNumber = 1;
            }
        }
        
        return String.format("%s%04d", yearPrefix, nextNumber);
    }
}