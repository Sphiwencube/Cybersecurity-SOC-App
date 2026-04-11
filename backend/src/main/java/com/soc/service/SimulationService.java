package com.soc.service;

import com.soc.model.Alert;
import com.soc.model.Incident;
import com.soc.model.User;
import com.soc.repository.AlertRepository;
import com.soc.repository.IncidentRepository;
import com.soc.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Slf4j
public class SimulationService {
    
    @Autowired
    private IncidentRepository incidentRepository;
    
    @Autowired
    private AlertRepository alertRepository;
    
    @Autowired
    private UserRepository userRepository;

    private final Random random = ThreadLocalRandom.current();
    
    private final String[][] INCIDENT_TEMPLATES = {
        {"Brute Force Attack Detected", "Multiple failed login attempts detected from IP %s targeting user account %s", "HIGH"},
        {"Malware Signature Match", "Endpoint protection detected %s malware family on workstation %s", "CRITICAL"},
        {"Suspicious Network Traffic", "Unusual outbound connection to known C2 server %s from internal host %s", "HIGH"},
        {"Data Exfiltration Attempt", "Large volume data transfer detected to external IP %s from database server %s", "CRITICAL"},
        {"Privilege Escalation Detected", "User %s attempted unauthorized privilege escalation on system %s", "HIGH"},
        {"Phishing Email Reported", "User %s reported suspicious email with attachment from %s", "MEDIUM"},
        {"SQL Injection Attempt", "Web application firewall blocked SQL injection attempt from IP %s on endpoint %s", "HIGH"},
        {"DDoS Attack Detected", "Distributed denial of service attack detected from multiple sources targeting %s", "CRITICAL"},
        {"Unauthorized Access Attempt", "After-hours login attempt by %s from unusual location %s", "MEDIUM"},
        {"Ransomware Indicators", "File encryption activity detected on workstation %s, possible %s ransomware", "CRITICAL"},
        {"Credential Harvesting", "Suspicious process attempting to access LSASS memory on %s by user %s", "HIGH"},
        {"Lateral Movement Detected", "Suspicious SMB connections from %s to multiple internal hosts including %s", "HIGH"},
        {"Zero-Day Exploit Attempt", "Anomalous behavior matching zero-day exploit pattern from IP %s targeting %s", "CRITICAL"},
        {"Insider Threat Indicator", "User %s accessed sensitive files outside normal pattern on system %s", "MEDIUM"},
        {"Supply Chain Attack", "Compromised software update detected from vendor %s on server %s", "CRITICAL"}
    };
    
    private final String[] IP_ADDRESSES = {
        "185.220.101.42", "192.168.1.100", "10.0.0.15", "172.16.0.23",
        "45.142.214.58", "192.168.50.10", "10.10.10.5", "203.0.113.45",
        "198.51.100.22", "192.0.2.100", "185.159.158.21", "45.9.148.123"
    };
    
    private final String[] MALWARE_FAMILIES = {
        "Emotet", "TrickBot", "Ryuk", "Conti", "LockBit", 
        "Cobalt Strike", "Meterpreter", "Mimikatz", "BloodHound", "Rubeus"
    };
    
    private final String[] WORKSTATIONS = {
        "WS-DEV-001", "WS-HR-002", "WS-FIN-003", "WS-IT-004", "WS-SALES-005",
        "SRV-DC-01", "SRV-DB-01", "SRV-WEB-01", "SRV-MAIL-01", "SRV-FILE-01"
    };
    
    private final String[] USERNAMES = {
        "john.doe", "jane.smith", "admin", "service.account", "backup.user",
        "sql.service", "web.service", "jenkins", "docker", "kubernetes"
    };
    
    private final String[] ATTACK_VECTORS = {
        "Spear Phishing", "Drive-by Download", "USB Drop", "Credential Stuffing",
        "Exploit Public-Facing Application", "External Remote Services", "Trusted Relationship"
    };
    
    @Scheduled(fixedDelayString = "${simulation.incident.interval:45000}")
    @Transactional
    public void generateRandomIncident() {
        try {
            if (random.nextDouble() > 0.3) {
                createSimulatedIncident();
            }
        } catch (Exception e) {
            log.error("Error generating simulated incident: {}", e.getMessage());
        }
    }
    
    @Scheduled(fixedDelayString = "${simulation.alert.interval:20000}")
    @Transactional
    public void generateRandomAlert() {
        try {
            if (random.nextDouble() > 0.4) {
                createSimulatedAlert();
            }
        } catch (Exception e) {
            log.error("Error generating simulated alert: {}", e.getMessage());
        }
    }
    
    private void createSimulatedIncident() {
        String[] template = INCIDENT_TEMPLATES[random.nextInt(INCIDENT_TEMPLATES.length)];
        String title = template[0];
        String descriptionTemplate = template[1];
        Incident.Severity severity = Incident.Severity.valueOf(template[2]);
        
        String ip = IP_ADDRESSES[random.nextInt(IP_ADDRESSES.length)];
        String workstation = WORKSTATIONS[random.nextInt(WORKSTATIONS.length)];
        String user = USERNAMES[random.nextInt(USERNAMES.length)];
        String malware = MALWARE_FAMILIES[random.nextInt(MALWARE_FAMILIES.length)];
        
        String description = descriptionTemplate
                .replace("%s", random.nextBoolean() ? ip : workstation)
                .replace("%s", random.nextBoolean() ? user : malware);
        
        Incident incident = new Incident();
        incident.setTitle(title);
        incident.setDescription(description);
        incident.setSeverity(severity);
        incident.setStatus(Incident.Status.OPEN);
        incident.setIncidentType(random.nextBoolean() ? "Security Incident" : "Malware Detection");
        incident.setSourceIp(ip);
        incident.setDestinationIp(random.nextBoolean() ? "10.0.0." + random.nextInt(255) : null);
        incident.setAttackVector(ATTACK_VECTORS[random.nextInt(ATTACK_VECTORS.length)]);
        incident.setMalwareFamily(random.nextBoolean() ? malware : null);
        incident.setAffectedAssets(workstation);
        
        List<User> systemUsers = userRepository.findAll();
        if (!systemUsers.isEmpty()) {
            User creator = systemUsers.get(random.nextInt(systemUsers.size()));
            incident.setCreatedBy(creator);
            
            if (random.nextDouble() > 0.5) {
                User assignee = systemUsers.get(random.nextInt(systemUsers.size()));
                incident.setAssignedTo(assignee);
            }
        }
        
        // Save first to generate ID
        Incident savedIncident = incidentRepository.save(incident);
        
        // Generate business incidentId from database ID
        String incidentId = "INC-" + LocalDateTime.now().getYear() + "-" +
                String.format("%05d", savedIncident.getId());
        savedIncident.setIncidentId(incidentId);
        
        // Save again with incidentId
        incidentRepository.save(savedIncident);
        
        log.info("🚨 SIMULATED INCIDENT CREATED: {} - {} [{}]", 
                savedIncident.getIncidentId(), 
                savedIncident.getTitle(),
                savedIncident.getSeverity());
    }
    
    private void createSimulatedAlert() {
        String[] alertTypes = {"IDS", "IPS", "SIEM", "EDR", "Firewall", "WAF"};
        String[] alertNames = {
            "Port Scan Detected", "Suspicious DNS Query", "Large File Transfer",
            "Failed Authentication Burst", "Known Bad IP Communication", 
            "Anomalous Process Execution", "Registry Modification", "Service Installation"
        };
        
        Alert alert = new Alert();
        alert.setAlertName(alertNames[random.nextInt(alertNames.length)]);
        alert.setAlertType(alertTypes[random.nextInt(alertTypes.length)]);
        alert.setSourceIp(IP_ADDRESSES[random.nextInt(IP_ADDRESSES.length)]);
        alert.setSeverity(Alert.Severity.values()[random.nextInt(Alert.Severity.values().length)]);
        alert.setStatus(Alert.Status.NEW);
        alert.setDescription("Automated security alert triggered by " + alert.getAlertType() + 
            " system. Source: " + alert.getSourceIp());
        
        Alert savedAlert = alertRepository.save(alert);
        log.debug("🔔 SIMULATED ALERT CREATED: {} [{}]", 
                savedAlert.getAlertName(), 
                savedAlert.getSeverity());
    }
    
    public void triggerManualIncident() {
        createSimulatedIncident();
    }
    
    public void generateBatchIncidents(int count) {
        for (int i = 0; i < count; i++) {
            createSimulatedIncident();
        }
    }
}
