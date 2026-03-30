import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../services/incident.service';
import { AlertService } from '../../services/alert.service';
import { ThreatIntelService } from '../../services/threat-intel.service';
import { DashboardStats } from '../../models/incident.model';
import { Alert } from '../../models/alert.model';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription, interval, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Interface for polling updates response
interface DashboardUpdates {
  hasNewIncidents: boolean;
  hasNewAlerts: boolean;
  newIncidentTitle?: string;
  newAlertName?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" data-aos="fade-up" data-aos-delay="0">
          <div class="stat-icon total">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats?.totalIncidents || 0 }}</span>
            <span class="stat-label">Total Incidents</span>
          </div>
          <div class="stat-trend">
            <i class="fas fa-arrow-up"></i>
          </div>
        </div>

        <div class="stat-card" data-aos="fade-up" data-aos-delay="100">
          <div class="stat-icon open">
            <i class="fas fa-folder-open"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats?.openIncidents || 0 }}</span>
            <span class="stat-label">Open Incidents</span>
          </div>
          <div class="stat-indicator pulse"></div>
        </div>

        <div class="stat-card critical" data-aos="fade-up" data-aos-delay="200">
          <div class="stat-icon critical-icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats?.criticalAlerts || 0 }}</span>
            <span class="stat-label">Critical Alerts</span>
          </div>
          <div class="stat-indicator danger"></div>
        </div>

        <div class="stat-card" data-aos="fade-up" data-aos-delay="300">
          <div class="stat-icon resolved">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats?.resolvedToday || 0 }}</span>
            <span class="stat-label">Resolved Today</span>
          </div>
          <div class="stat-trend up">
            <i class="fas fa-arrow-up"></i>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <div class="chart-card" data-aos="fade-up" data-aos-delay="400">
          <div class="card-header">
            <h3><i class="fas fa-chart-pie"></i> Incidents by Severity</h3>
          </div>
          <div class="chart-container">
            <div class="severity-chart">
              <div 
                class="severity-bar" 
                *ngFor="let item of severityData; let i = index"
                [style.height.%]="item.percentage"
                [class]="'bar-' + item.severity.toLowerCase()"
                [attr.data-value]="item.count"
              >
                <span class="bar-label">{{ item.severity }}</span>
                <span class="bar-value">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card" data-aos="fade-up" data-aos-delay="500">
          <div class="card-header">
            <h3><i class="fas fa-chart-bar"></i> Incidents by Status</h3>
          </div>
          <div class="chart-container">
            <div class="status-donut">
              <svg viewBox="0 0 100 100" class="donut-chart">
                <circle 
                  *ngFor="let segment of statusSegments; let i = index"
                  class="donut-segment"
                  [attr.stroke-dasharray]="segment.dashArray"
                  [attr.stroke-dashoffset]="segment.dashOffset"
                  [attr.stroke]="segment.color"
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke-width="20"
                />
                <text x="50" y="50" text-anchor="middle" dy="0.3em" class="donut-center">
                  {{ stats?.totalIncidents || 0 }}
                </text>
              </svg>
              <div class="donut-legend">
                <div class="legend-item" *ngFor="let item of statusLegend">
                  <span class="legend-color" [style.background]="item.color"></span>
                  <span class="legend-label">{{ item.label }}</span>
                  <span class="legend-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card" data-aos="fade-up" data-aos-delay="600">
          <div class="card-header">
            <h3><i class="fas fa-brain"></i> Threat Indicators</h3>
          </div>
          <div class="chart-container">
            <div class="threat-gauge">
              <div class="gauge-circle">
                <svg viewBox="0 0 100 100">
                  <circle class="gauge-bg" cx="50" cy="50" r="45"/>
                  <circle 
                    class="gauge-fill" 
                    cx="50" cy="50" r="45"
                    [style.stroke-dasharray]="threatGaugeCircumference"
                    [style.stroke-dashoffset]="threatGaugeOffset"
                  />
                </svg>
                <div class="gauge-value">
                  <span class="gauge-number">{{ threatIndicators }}</span>
                  <span class="gauge-label">Active</span>
                </div>
              </div>
              <div class="threat-types">
                <div class="threat-type" *ngFor="let type of threatTypes">
                  <i [class]="type.icon"></i>
                  <span>{{ type.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Alerts & Activity -->
      <div class="bottom-row">
        <div class="alerts-card" data-aos="fade-up" data-aos-delay="700">
          <div class="card-header">
            <h3><i class="fas fa-bell"></i> Recent Alerts</h3>
            <a routerLink="/alerts" class="view-all">View All <i class="fas fa-arrow-right"></i></a>
          </div>
          <div class="alerts-list">
            <div 
              class="alert-item" 
              *ngFor="let alert of recentAlerts; let i = index"
              [class]="'severity-' + alert.severity.toLowerCase()"
              [style.animation-delay]="i * 100 + 'ms'"
            >
              <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="alert-content">
                <span class="alert-name">{{ alert.alertName }}</span>
                <span class="alert-meta">
                  <span class="badge" [class]="'badge-' + alert.severity.toLowerCase()">{{ alert.severity }}</span>
                  <span class="alert-time">{{ formatTime(alert.createdAt) }}</span>
                </span>
              </div>
              <div class="alert-status" [class]="alert.status.toLowerCase()">
                {{ alert.status }}
              </div>
            </div>
            <div class="empty-state" *ngIf="recentAlerts.length === 0">
              <i class="fas fa-check-circle"></i>
              <p>No recent alerts</p>
            </div>
          </div>
        </div>

        <div class="activity-card" data-aos="fade-up" data-aos-delay="800">
          <div class="card-header">
            <h3><i class="fas fa-history"></i> Recent Activity</h3>
          </div>
          <div class="activity-timeline">
            <div 
              class="activity-item" 
              *ngFor="let activity of recentActivities; let i = index"
              [style.animation-delay]="i * 100 + 'ms'"
            >
              <div class="activity-dot" [class]="activity.severity.toLowerCase()"></div>
              <div class="activity-content">
                <span class="activity-type">{{ activity.type }}</span>
                <span class="activity-desc">{{ activity.description }}</span>
                <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
              </div>
            </div>
            <div class="empty-state" *ngIf="recentActivities.length === 0">
              <i class="fas fa-info-circle"></i>
              <p>No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      border-color: var(--accent-cyan);
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow);
    }

    .stat-card.critical {
      border-color: var(--severity-critical);
      animation: criticalPulse 2s ease-in-out infinite;
    }

    @keyframes criticalPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
      50% { box-shadow: 0 0 20px 0 rgba(220, 38, 38, 0.4); }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-icon.total {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }

    .stat-icon.open {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .stat-icon.critical-icon {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      animation: iconPulse 1.5s ease-in-out infinite;
    }

    .stat-icon.resolved {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    @keyframes iconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .stat-trend {
      margin-left: auto;
      font-size: 0.875rem;
      color: var(--accent-green);
    }

    .stat-trend.up {
      color: var(--accent-green);
    }

    .stat-indicator {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .stat-indicator.pulse {
      background: var(--accent-yellow);
      animation: pulse 2s infinite;
    }

    .stat-indicator.danger {
      background: var(--accent-red);
      animation: pulse 1s infinite;
    }

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 1024px) {
      .charts-row {
        grid-template-columns: 1fr;
      }
    }

    .chart-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .card-header h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card-header h3 i {
      color: var(--accent-cyan);
    }

    .view-all {
      font-size: 0.875rem;
      color: var(--accent-cyan);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .chart-container {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Severity Chart */
    .severity-chart {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
      height: 100%;
      padding: 0 1rem;
    }

    .severity-bar {
      flex: 1;
      min-width: 40px;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      position: relative;
      transition: all 0.3s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding-bottom: 0.5rem;
    }

    .severity-bar:hover {
      filter: brightness(1.2);
    }

    .bar-critical {
      background: linear-gradient(180deg, #ef4444, #dc2626);
    }

    .bar-high {
      background: linear-gradient(180deg, #f97316, #ea580c);
    }

    .bar-medium {
      background: linear-gradient(180deg, #eab308, #ca8a04);
    }

    .bar-low {
      background: linear-gradient(180deg, #22c55e, #16a34a);
    }

    .bar-info {
      background: linear-gradient(180deg, #3b82f6, #2563eb);
    }

    .bar-label {
      font-size: 0.6875rem;
      color: white;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .bar-value {
      font-size: 0.875rem;
      color: white;
      font-weight: 700;
    }

    /* Status Donut Chart */
    .status-donut {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .donut-chart {
      width: 150px;
      height: 150px;
      transform: rotate(-90deg);
    }

    .donut-segment {
      transition: all 0.3s ease;
    }

    .donut-center {
      font-size: 1.5rem;
      font-weight: 700;
      fill: var(--text-primary);
      transform: rotate(90deg);
      transform-origin: center;
    }

    .donut-legend {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-label {
      color: var(--text-secondary);
    }

    .legend-value {
      color: var(--text-primary);
      font-weight: 600;
      margin-left: auto;
    }

    /* Threat Gauge */
    .threat-gauge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .gauge-circle {
      position: relative;
      width: 150px;
      height: 150px;
    }

    .gauge-circle svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .gauge-bg {
      fill: none;
      stroke: var(--border-color);
      stroke-width: 10;
    }

    .gauge-fill {
      fill: none;
      stroke: url(#gaugeGradient);
      stroke-width: 10;
      stroke-linecap: round;
      transition: stroke-dashoffset 1s ease;
    }

    .gauge-value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .gauge-number {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--accent-cyan);
    }

    .gauge-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .threat-types {
      display: flex;
      gap: 1rem;
    }

    .threat-type {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .threat-type i {
      font-size: 1.25rem;
      color: var(--accent-cyan);
    }

    /* Bottom Row */
    .bottom-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 1024px) {
      .bottom-row {
        grid-template-columns: 1fr;
      }
    }

    .alerts-card,
    .activity-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }

    /* Alerts List */
    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--secondary-bg);
      border-radius: var(--radius-md);
      border-left: 3px solid transparent;
      animation: slideInLeft 0.3s ease forwards;
      opacity: 0;
    }

    .alert-item.severity-critical {
      border-left-color: var(--severity-critical);
    }

    .alert-item.severity-high {
      border-left-color: var(--severity-high);
    }

    .alert-item.severity-medium {
      border-left-color: var(--severity-medium);
    }

    .alert-item.severity-low {
      border-left-color: var(--severity-low);
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

    .alert-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .alert-name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .alert-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .alert-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .alert-status {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
    }

    .alert-status.new {
      background: rgba(59, 130, 246, 0.2);
      color: var(--severity-info);
    }

    .alert-status.acknowledged {
      background: rgba(245, 158, 11, 0.2);
      color: var(--severity-medium);
    }

    /* Activity Timeline */
    .activity-timeline {
      position: relative;
      padding-left: 1.5rem;
    }

    .activity-timeline::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--border-color);
    }

    .activity-item {
      position: relative;
      padding-bottom: 1.5rem;
      animation: fadeInUp 0.3s ease forwards;
      opacity: 0;
    }

    .activity-dot {
      position: absolute;
      left: -1.5rem;
      top: 0;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid var(--card-bg);
    }

    .activity-dot.critical {
      background: var(--severity-critical);
    }

    .activity-dot.high {
      background: var(--severity-high);
    }

    .activity-dot.medium {
      background: var(--severity-medium);
    }

    .activity-dot.low {
      background: var(--severity-low);
    }

    .activity-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .activity-type {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .activity-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .activity-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: var(--text-muted);
    }

    .empty-state i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  private pollingSubscription: Subscription | null = null;
  private readonly POLLING_INTERVAL = 30000; // 30 seconds

  stats: DashboardStats | null = null;
  recentAlerts: Alert[] = [];
  recentActivities: any[] = [];
  threatIndicators = 0;

  severityData: any[] = [];
  statusSegments: any[] = [];
  statusLegend: any[] = [];

  threatGaugeCircumference = 2 * Math.PI * 45;
  threatGaugeOffset = this.threatGaugeCircumference;

  threatTypes = [
    { icon: 'fas fa-globe', label: 'IPs' },
    { icon: 'fas fa-link', label: 'Domains' },
    { icon: 'fas fa-file-code', label: 'Hashes' }
  ];

  constructor(
    private incidentService: IncidentService,
    private alertService: AlertService,
    private threatIntelService: ThreatIntelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadAlerts();
    this.loadThreatIndicators();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stopPolling();
  }

  loadDashboardData(): void {
    this.incidentService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.processSeverityData(stats.incidentsBySeverity);
        this.processStatusData(stats.incidentsByStatus);
        this.recentActivities = stats.recentActivities || [];
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  loadAlerts(): void {
    this.alertService.getNewAlerts().subscribe({
      next: (alerts) => {
        this.recentAlerts = alerts.slice(0, 5);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading alerts:', error);
      }
    });
  }

  loadThreatIndicators(): void {
    this.threatIntelService.getActiveIndicatorsCount().subscribe({
      next: (response) => {
        this.threatIndicators = response.count;
        const percentage = Math.min(this.threatIndicators / 100, 1);
        this.threatGaugeOffset = this.threatGaugeCircumference * (1 - percentage);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading threat indicators:', error);
      }
    });
  }

  /**
   * Start polling for real-time updates
   * Polls every 30 seconds to check for new data
   */
  private startPolling(): void {
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(
        switchMap((): Observable<DashboardUpdates> => this.incidentService.checkForUpdates())
      )
      .subscribe({
        next: (updates: DashboardUpdates) => {
          if (updates.hasNewIncidents) {
            this.showNotification('New Incident', updates.newIncidentTitle || 'A new incident has been reported');
            this.loadDashboardData();
          }
          if (updates.hasNewAlerts) {
            this.showNotification('New Alert', updates.newAlertName || 'A new alert has been triggered');
            this.loadAlerts();
          }
        },
        error: (error) => {
          console.error('Error during polling:', error);
        }
      });
  }

  /**
   * Stop the polling subscription
   */
  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  /**
   * Manually refresh all dashboard data
   * Can be called from UI (e.g., refresh button)
   */
  refreshData(): void {
    this.loadDashboardData();
    this.loadAlerts();
    this.loadThreatIndicators();
  }

  processSeverityData(data: { [key: string]: number }): void {
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    const maxValue = Math.max(...Object.values(data), 1);

    this.severityData = severities.map(severity => ({
      severity,
      count: data[severity] || 0,
      percentage: ((data[severity] || 0) / maxValue) * 100
    }));
  }

  processStatusData(data: { [key: string]: number }): void {
    const colors: { [key: string]: string } = {
      'OPEN': '#ef4444',
      'IN_PROGRESS': '#f59e0b',
      'RESOLVED': '#10b981',
      'CLOSED': '#6b7280'
    };

    const total = Object.values(data).reduce((a, b) => a + b, 0);
    let cumulativePercent = 0;

    this.statusSegments = Object.entries(data).map(([status, count]) => {
      const percent = (count / total) * 100;
      const dashArray = `${percent} ${100 - percent}`;
      const dashOffset = -cumulativePercent;
      cumulativePercent += percent;

      return {
        dashArray,
        dashOffset,
        color: colors[status] || '#6b7280'
      };
    });

    this.statusLegend = Object.entries(data).map(([status, count]) => ({
      label: status.replace('_', ' '),
      value: count,
      color: colors[status] || '#6b7280'
    }));
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  }

  someMethod() {
    // ... update data
    this.cdr.markForCheck(); // Trigger change detection manually
  }

  private showNotification(title: string, message: string): void {
    // You can use a toast service here
    console.log(`[${title}] ${message}`);

    // Browser notification (optional)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  }
}