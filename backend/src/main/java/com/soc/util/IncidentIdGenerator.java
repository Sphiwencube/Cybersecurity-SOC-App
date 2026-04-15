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
     * Format: INC-YYYY-XXX (e.g., INC-2026-001)
     */
    public String generateNextId() {
        int currentYear = Year.now().getValue();
        String yearPrefix = String.format("INC-%d-", currentYear);
        
        // Get the last incident ID for this year from the database
        String lastId = incidentRepository.findLastIncidentIdForYear(currentYear);
        
        int nextNumber = 1;
        if (lastId != null && !lastId.isEmpty()) {
            try {
                // Extract the number part from the last ID (works for INC-2026-001 and INC-2026-0001)
                int lastHyphen = lastId.lastIndexOf('-');
                if (lastHyphen != -1) {
                    String numberPart = lastId.substring(lastHyphen + 1);
                    nextNumber = Integer.parseInt(numberPart) + 1;
                }
            } catch (NumberFormatException e) {
                nextNumber = 1;
            }
        }
        
        // Using %03d as requested to maintain 3-digit sequence (e.g., 001, 002)
        return String.format("%s%03d", yearPrefix, nextNumber);
    }
}
