import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';
import { Alert } from '../../models/alert.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alerts-page">
      <div class="page-header" data-aos="fade-down">
        <h2>Security Alerts</h2>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ newAlertsCount }}</span>
            <span class="stat-label">New</span>
          </div>
          <div class="stat-item critical">
            <span class="stat-value">{{ criticalAlertsCount }}</span>
            <span class="stat-label">Critical</span>
          </div>
        </div>
      </div>
      
      <div class="alerts-grid">
        <div 
          class="alert-card" 
          *ngFor="let alert of alerts; let i = index"
          [class]="'severity-' + alert.severity.toLowerCase()"
          [style.animation-delay]="i * 100 + 'ms'"
          data-aos="fade-up"
        >
          <div class="alert-header">
            <div class="alert-icon">
              <i class="fas fa-bell"></i>
            </div>
            <div class="alert-meta">
              <span class="badge" [class]="'badge-' + alert.severity.toLowerCase()">
                {{ alert.severity }}
              </span>
              <span class="alert-time">{{ formatTime(alert.createdAt) }}</span>
            </div>
          </div>
          
          <h3 class="alert-title">{{ alert.alertName }}</h3>
          <p class="alert-description">{{ alert.description }}</p>
          
          <div class="alert-footer">
            <span class="alert-source">
              <i class="fas fa-server"></i> {{ alert.source }}
            </span>
            <div class="alert-actions">
              <button 
                *ngIf="alert.status === 'NEW'"
                class="btn btn-sm btn-secondary"
                (click)="acknowledgeAlert(alert.id)"
                [disabled]="loading[alert.id]"
              >
                <i class="fas fa-check" *ngIf="!loading[alert.id]"></i>
                <i class="fas fa-spinner fa-spin" *ngIf="loading[alert.id]"></i>
                Acknowledge
              </button>
              <button 
                *ngIf="alert.status !== 'RESOLVED'"
                class="btn btn-sm btn-success"
                (click)="resolveAlert(alert.id)"
                [disabled]="loading[alert.id]"
              >
                <i class="fas fa-check-double" *ngIf="!loading[alert.id]"></i>
                <i class="fas fa-spinner fa-spin" *ngIf="loading[alert.id]"></i>
                Resolve
              </button>
            </div>
          </div>
          
          <div class="status-indicator" [class]="alert.status.toLowerCase()">
            {{ alert.status }}
          </div>
        </div>
      </div>
      
      <div class="empty-state" *ngIf="alerts.length === 0" data-aos="fade-up">
        <i class="fas fa-check-circle"></i>
        <h3>All Clear!</h3>
        <p>No alerts to display at this time.</p>
      </div>
    </div>
  `,
  styles: [`
    .alerts-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .page-header h2 {
      font-size: 1.5rem;
    }
    
    .header-stats {
      display: flex;
      gap: 1.5rem;
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem 1.5rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }
    
    .stat-item.critical {
      border-color: var(--severity-critical);
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .stat-item.critical .stat-value {
      color: var(--severity-critical);
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    
    .alerts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1rem;
    }
    
    .alert-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      animation: fadeInUp 0.3s ease forwards;
      opacity: 0;
    }
    
    .alert-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
    }
    
    .alert-card.severity-critical::before {
      background: var(--severity-critical);
    }
    
    .alert-card.severity-high::before {
      background: var(--severity-high);
    }
    
    .alert-card.severity-medium::before {
      background: var(--severity-medium);
    }
    
    .alert-card.severity-low::before {
      background: var(--severity-low);
    }
    
    .alert-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .alert-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    
    .alert-icon {
      width: 40px;
      height: 40px;
      background: rgba(239, 68, 68, 0.1);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-red);
    }
    
    .alert-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .alert-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .alert-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }
    
    .alert-description {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    
    .alert-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .alert-source {
      font-size: 0.75rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }
    
    .alert-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .alert-actions button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .status-indicator {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    
    .status-indicator.new {
      background: rgba(59, 130, 246, 0.2);
      color: var(--severity-info);
    }
    
    .status-indicator.acknowledged {
      background: rgba(245, 158, 11, 0.2);
      color: var(--severity-medium);
    }
    
    .status-indicator.resolved {
      background: rgba(16, 185, 129, 0.2);
      color: var(--severity-low);
    }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);
    }
    
    .empty-state i {
      font-size: 4rem;
      color: var(--accent-green);
      margin-bottom: 1rem;
    }
    
    .empty-state h3 {
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
  `]
})
export class AlertsComponent implements OnInit {
  alerts: Alert[] = [];
  newAlertsCount = 0;
  criticalAlertsCount = 0;
  loading: { [key: number]: boolean } = {};
  
  constructor(private alertService: AlertService) {}
  
  ngOnInit(): void {
    this.loadAlerts();
  }
  
  loadAlerts(): void {
    this.alertService.getAllAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.newAlertsCount = alerts.filter(a => a.status === 'NEW').length;
        this.criticalAlertsCount = alerts.filter(a => a.severity === 'CRITICAL').length;
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
      }
    });
  }
  
  acknowledgeAlert(id: number): void {
    this.loading[id] = true;
    this.alertService.acknowledgeAlert(id).subscribe({
      next: () => {
        this.loading[id] = false;
        this.loadAlerts(); // Refresh the list
      },
      error: (error) => {
        this.loading[id] = false;
        console.error('Error acknowledging alert:', error);
        alert('Failed to acknowledge alert. Please try again.');
      }
    });
  }
  
  resolveAlert(id: number): void {
    this.loading[id] = true;
    this.alertService.resolveAlert(id).subscribe({
      next: () => {
        this.loading[id] = false;
        this.loadAlerts(); // Refresh the list
      },
      error: (error) => {
        this.loading[id] = false;
        console.error('Error resolving alert:', error);
        alert('Failed to resolve alert. Please try again.');
      }
    });
  }
  
  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleDateString();
  }
}