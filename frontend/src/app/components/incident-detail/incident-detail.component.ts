import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IncidentService } from '../../services/incident.service';
import { Incident } from '../../models/incident.model';

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="incident-detail" *ngIf="incident">
      <div class="detail-header" data-aos="fade-down">
        <a routerLink="/incidents" class="back-link">
          <i class="fas fa-arrow-left"></i> Back to Incidents
        </a>
        <div class="header-actions">
          <span class="badge" [class]="'badge-' + incident.severity.toLowerCase()">
            {{ incident.severity }}
          </span>
          <span class="status-badge" [class]="incident.status.toLowerCase()">
            {{ incident.status.replace('_', ' ') }}
          </span>
        </div>
      </div>
      
      <div class="detail-card" data-aos="fade-up">
        <h1>{{ incident.title }}</h1>
        <p class="incident-id">{{ incident.incidentId }}</p>
        
        <div class="detail-grid">
          <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> Description</h3>
            <p>{{ incident.description || 'No description provided' }}</p>
          </div>
          
          <div class="detail-section">
            <h3><i class="fas fa-network-wired"></i> Network Details</h3>
            <div class="detail-row">
              <span class="label">Source IP:</span>
              <span class="value mono">{{ incident.sourceIp || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Destination IP:</span>
              <span class="value mono">{{ incident.destinationIp || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Attack Vector:</span>
              <span class="value">{{ incident.attackVector || 'N/A' }}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h3><i class="fas fa-user"></i> Assignment</h3>
            <div class="detail-row">
              <span class="label">Assigned To:</span>
              <span class="value">{{ incident.assignedToName || 'Unassigned' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Created By:</span>
              <span class="value">{{ incident.createdByName || 'Unknown' }}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h3><i class="fas fa-clock"></i> Timeline</h3>
            <div class="detail-row">
              <span class="label">Created:</span>
              <span class="value">{{ formatDate(incident.createdAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Updated:</span>
              <span class="value">{{ formatDate(incident.updatedAt) }}</span>
            </div>
            <div class="detail-row" *ngIf="incident.resolvedAt">
              <span class="label">Resolved:</span>
              <span class="value">{{ formatDate(incident.resolvedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .incident-detail {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .back-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--accent-cyan);
      font-weight: 500;
    }
    
    .header-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.375rem 0.875rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-badge.open {
      background: rgba(239, 68, 68, 0.2);
      color: var(--accent-red);
    }
    
    .status-badge.in_progress {
      background: rgba(245, 158, 11, 0.2);
      color: var(--accent-yellow);
    }
    
    .status-badge.resolved {
      background: rgba(16, 185, 129, 0.2);
      color: var(--accent-green);
    }
    
    .status-badge.closed {
      background: rgba(107, 114, 128, 0.2);
      color: var(--text-muted);
    }
    
    .detail-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 2rem;
    }
    
    .detail-card h1 {
      font-size: 1.75rem;
      margin-bottom: 0.25rem;
    }
    
    .incident-id {
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
    
    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .detail-section {
      background: var(--secondary-bg);
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }
    
    .detail-section h3 {
      font-size: 1rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--accent-cyan);
    }
    
    .detail-section p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.625rem 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .label {
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    
    .value {
      color: var(--text-primary);
      font-weight: 500;
    }
  `]
})
export class IncidentDetailComponent implements OnInit {
  incident: Incident | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private incidentService: IncidentService
  ) {}
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadIncident(+id);
    }
  }
  
  loadIncident(id: number): void {
    this.incidentService.getIncidentById(id).subscribe({
      next: (incident) => {
        this.incident = incident;
      },
      error: (error) => {
        console.error('Error loading incident:', error);
      }
    });
  }
  
  formatDate(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
