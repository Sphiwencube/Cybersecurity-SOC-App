import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

interface Recommendation {
  id: string;
  priority: string;
  title: string;
  description: string;
  action: string;
  action_label: string;
  count: number;
  applying?: boolean;
}

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-page">
      <div class="page-header" data-aos="fade-down">
        <h2>AI-Powered Analytics</h2>
      </div>
      
      <div class="analytics-grid">
        <!-- AI Recommendations -->
        <div class="analytics-card full-width" data-aos="fade-up">
          <div class="card-header">
            <h3><i class="fas fa-lightbulb"></i> AI Recommendations</h3>
            <button class="btn btn-sm btn-secondary" (click)="loadRecommendations()">
              <i class="fas fa-sync"></i> Refresh
            </button>
          </div>
          <div class="recommendations-list" *ngIf="recommendations.length > 0">
            <div class="recommendation-item" *ngFor="let rec of recommendations">
              <div class="rec-priority" [class]="rec.priority">
                <i class="fas fa-exclamation"></i>
              </div>
              <div class="rec-content">
                <h4>{{ rec.title }}</h4>
                <p>{{ rec.description }}</p>
                <span class="rec-meta" *ngIf="rec.count > 0">{{ rec.count }} items</span>
              </div>
              <button 
                class="btn btn-sm btn-primary" 
                (click)="applyRecommendation(rec)"
                [disabled]="rec.applying || rec.action === 'none'"
              >
                <i class="fas fa-spinner fa-spin" *ngIf="rec.applying"></i>
                {{ rec.action_label }}
              </button>
            </div>
          </div>
          <div class="empty-state" *ngIf="recommendations.length === 0">
            <i class="fas fa-robot"></i>
            <p>Loading AI recommendations...</p>
          </div>
        </div>
        
        <!-- Incident Forest -->
        <div class="analytics-card full-width incident-forest" data-aos="fade-up" data-aos-delay="100">
          <div class="card-header">
            <h3><i class="fas fa-project-diagram"></i> Incident Forest - Attack Path Analysis</h3>
          </div>
          <div class="forest-content" *ngIf="forestData">
            <div class="forest-stats">
              <div class="stat-box">
                <span class="stat-number">{{ forestData.summary.total_incidents }}</span>
                <span class="stat-label">Total Incidents</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ forestData.summary.relationships_found }}</span>
                <span class="stat-label">Relationships</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ forestData.summary.attack_patterns_identified }}</span>
                <span class="stat-label">Attack Patterns</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ forestData.summary.threat_actors_identified }}</span>
                <span class="stat-label">Threat Actors</span>
              </div>
            </div>
            
            <div class="forest-visualization">
              <div class="forest-nodes">
                <div 
                  class="forest-node" 
                  *ngFor="let node of forestData.nodes"
                  [class]="'severity-' + node.severity.toLowerCase()"
                >
                  <span class="node-id">{{ node.label }}</span>
                  <span class="node-title">{{ node.title }}</span>
                  <span class="node-type">{{ node.type }}</span>
                </div>
              </div>
            </div>
            
            <div class="forest-patterns" *ngIf="forestData.attack_patterns.length > 0">
              <h4>Identified Attack Patterns</h4>
              <div class="pattern-list">
                <div class="pattern-item" *ngFor="let pattern of forestData.attack_patterns">
                  <span class="pattern-vector">{{ pattern.vector }}</span>
                  <span class="pattern-count">{{ pattern.count }} incidents</span>
                  <div class="pattern-severities">
                    <span 
                      class="severity-tag" 
                      *ngFor="let sev of pattern.severities"
                      [class]="'sev-' + sev.toLowerCase()"
                    >
                      {{ sev }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-state" *ngIf="!forestData">
            <i class="fas fa-tree"></i>
            <p>Loading incident forest data...</p>
          </div>
        </div>
        
        <!-- Predictive Analysis -->
        <div class="analytics-card" data-aos="fade-up" data-aos-delay="200">
          <div class="card-header">
            <h3><i class="fas fa-brain"></i> Predictive Analysis</h3>
            <span class="last-updated" *ngIf="predictiveMetrics.total_analyzed > 0">
              {{ predictiveMetrics.total_analyzed }} incidents analyzed
            </span>
          </div>
          <div class="analytics-content">
            <div class="metric-row">
              <span class="metric-label">Threat Prediction Accuracy</span>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="predictiveMetrics.threat_prediction_accuracy"></div>
              </div>
              <span class="metric-value">{{ predictiveMetrics.threat_prediction_accuracy }}%</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">False Positive Rate</span>
              <div class="progress-bar">
                <div class="progress-fill warning" [style.width.%]="predictiveMetrics.false_positive_rate"></div>
              </div>
              <span class="metric-value">{{ predictiveMetrics.false_positive_rate }}%</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Model Confidence</span>
              <div class="progress-bar">
                <div class="progress-fill success" [style.width.%]="predictiveMetrics.model_confidence"></div>
              </div>
              <span class="metric-value">{{ predictiveMetrics.model_confidence }}%</span>
            </div>
          </div>
        </div>
        
        <!-- Incident Forecast -->
        <div class="analytics-card" data-aos="fade-up" data-aos-delay="300">
          <div class="card-header">
            <h3><i class="fas fa-chart-line"></i> Incident Forecast</h3>
            <span class="last-updated">Live updates • 2h slots</span>
          </div>
          <div class="chart-wrapper">
            <canvas #hourlyCanvas id="hourlyIncidentChart"></canvas>
          </div>
          <div class="chart-legend">
            <span class="legend-item"><span class="dot low"></span> Low (0-4)</span>
            <span class="legend-item"><span class="dot med"></span> Med (5-9)</span>
            <span class="legend-item"><span class="dot high"></span> High (10+)</span>
            <span class="legend-item current"><span class="dot current-dot"></span> Current Slot</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .page-header h2 {
      font-size: 1.5rem;
    }
    
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .analytics-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }
    
    .analytics-card.full-width {
      grid-column: 1 / -1;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    .card-header h3 {
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-primary);
      margin: 0;
    }
    
    .card-header h3 i {
      color: var(--accent-cyan);
    }
    
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
      padding: 10px;
    }

    .metric-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .metric-label {
      min-width: 180px;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .last-updated {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
      font-weight: normal;
    }
    
    .progress-bar {
      flex: 1;
      height: 8px;
      background: var(--secondary-bg);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));
      border-radius: 4px;
      transition: width 1s ease;
    }
    
    .progress-fill.warning {
      background: linear-gradient(90deg, var(--accent-yellow), var(--accent-orange));
    }
    
    .progress-fill.success {
      background: linear-gradient(90deg, var(--accent-green), #059669);
    }
    
    .metric-value {
      min-width: 50px;
      text-align: right;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .forecast-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 200px;
      padding: 1rem 0;
    }
    
    .forecast-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .bar {
      width: 40px;
      background: linear-gradient(180deg, var(--accent-cyan), var(--accent-blue));
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      position: relative;
      transition: all 0.3s ease;
      cursor: pointer;
      min-height: 20px;
    }
    
    .bar:hover {
      filter: brightness(1.2);
    }
    
    .bar-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--secondary-bg);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
      margin-bottom: 0.5rem;
    }
    
    .bar:hover .bar-tooltip {
      opacity: 1;
    }
    
    .bar-label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .recommendation-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--secondary-bg);
      border-radius: var(--radius-md);
      border-left: 3px solid transparent;
    }
    
    .recommendation-item:has(.rec-priority.high) {
      border-left-color: var(--accent-red);
    }
    
    .rec-priority {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }
    
    .rec-priority.high {
      background: rgba(239, 68, 68, 0.2);
      color: var(--accent-red);
    }
    
    .rec-priority.medium {
      background: rgba(245, 158, 11, 0.2);
      color: var(--accent-yellow);
    }
    
    .rec-priority.low {
      background: rgba(16, 185, 129, 0.2);
      color: var(--accent-green);
    }
    
    .rec-content {
      flex: 1;
    }
    
    .rec-content h4 {
      font-size: 0.9375rem;
      margin-bottom: 0.25rem;
      color: var(--text-primary);
    }
    
    .rec-content p {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }
    
    .rec-meta {
      font-size: 0.75rem;
      color: var(--accent-cyan);
    }
    
    .incident-forest .forest-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .stat-box {
      background: var(--secondary-bg);
      padding: 1rem;
      border-radius: var(--radius-md);
      text-align: center;
    }
    
    .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-cyan);
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .forest-visualization {
      background: var(--secondary-bg);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      min-height: 200px;
    }
    
    .forest-nodes {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .forest-node {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      min-width: 150px;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .forest-node.severity-critical {
      border-color: var(--severity-critical);
      box-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
    }
    
    .forest-node.severity-high {
      border-color: var(--severity-high);
    }
    
    .forest-node.severity-medium {
      border-color: var(--severity-medium);
    }
    
    .node-id {
      font-size: 0.75rem;
      color: var(--accent-cyan);
      font-weight: 600;
    }
    
    .node-title {
      font-size: 0.8125rem;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .node-type {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }
    
    .forest-patterns h4 {
      font-size: 0.9375rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }
    
    .pattern-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .pattern-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: var(--secondary-bg);
      border-radius: var(--radius-md);
    }
    
    .pattern-vector {
      font-weight: 500;
      color: var(--text-primary);
      min-width: 150px;
    }
    
    .pattern-count {
      font-size: 0.875rem;
      color: var(--accent-cyan);
    }
    
    .pattern-severities {
      display: flex;
      gap: 0.5rem;
      margin-left: auto;
    }
    
    .severity-tag {
      font-size: 0.6875rem;
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
    }
    
    .severity-tag.sev-critical {
      background: rgba(239, 68, 68, 0.2);
      color: var(--severity-critical);
    }
    
    .severity-tag.sev-high {
      background: rgba(249, 115, 22, 0.2);
      color: var(--severity-high);
    }
    
    .severity-tag.sev-medium {
      background: rgba(234, 179, 8, 0.2);
      color: var(--severity-medium);
    }
    
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
    }
    
    .empty-state i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .chart-wrapper {
      position: relative; 
      height: 250px;
      width: 100%;
      margin-bottom: 15px;
    }
    .chart-wrapper canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
    }
    .chart-legend {
      display: flex;
      justify-content: flex-start;
      gap: 20px;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      display: inline-block;
    }

    .dot.low { 
      background: rgb(54, 162, 235); /* Blue */
      box-shadow: 0 0 8px rgba(54, 162, 235, 0.4);
    }
    .dot.med { 
      background: rgb(255, 206, 86); /* Yellow */
      box-shadow: 0 0 8px rgba(255, 206, 86, 0.4);
    }

    .dot.high { 
      background: rgb(255, 99, 132); /* Red */
      box-shadow: 0 0 8px rgba(255, 99, 132, 0.4);
    }

    .current-dot { 
      background: rgb(56, 189, 248); /* Cyan */
      border: 2px solid rgb(255, 255, 255);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
      width: 10px;
      height: 10px;
    }

    .legend-item.current {
      color: rgb(255, 255, 255);
      font-weight: 500;
    }
  `]
})
export class AnalyticsComponent implements OnInit, OnDestroy, AfterViewInit {
  recommendations: Recommendation[] = [];
  forestData: any = null;

  hourlyChart: Chart | null = null;

  predictiveMetrics: any = {
    threat_prediction_accuracy: 0,
    false_positive_rate: 0,
    model_confidence: 0,
    total_analyzed: 0
  };

  @ViewChild('hourlyCanvas', { static: false }) hourlyCanvas!: ElementRef<HTMLCanvasElement>;

  private aiApiUrl = 'http://localhost:5000/api';

  private pollingSubscription: Subscription | null = null;

  private readonly POLLING_INTERVAL = 30 * 1000;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRecommendations();
    this.loadIncidentForest();
    this.loadPredictiveMetrics();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initHourlyChart();
      this.loadHourlyData();
    }, 100);
    this.pollingSubscription = interval(this.POLLING_INTERVAL).subscribe(() => {
      this.loadHourlyData();
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.hourlyChart) {
      this.hourlyChart.destroy();
    }
  }

  initHourlyChart(): void {
    const canvas = this.hourlyCanvas?.nativeElement || document.getElementById('hourlyIncidentChart') as HTMLCanvasElement;

    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Incidents',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: 'rgba(54, 162, 235, 1)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 10,
            cornerRadius: 4,
            displayColors: false,
            callbacks: {
              title: (context: { label: any; }[]) => {
                return `Hour: ${context[0].label}`;
              },
              label: (context: any) => {
                const y = context.parsed.y || 0;
                return `${y} incident${y !== 1 ? 's' : ''}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#666'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#666'
            },
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    };
    this.hourlyChart = new Chart(ctx, config);
  }

  loadHourlyData(): void {
    this.http.get<any>('http://localhost:5000/api/analyze/incidents').subscribe({
      next: (data) => {
        if (data.two_hour_slots) {
          this.updateChart(data.two_hour_slots);
        }
      },
      error: (error) => {
        console.error('Error loading hourly data:', error);
      }
    })
  }

  updateChart(hourlyData: any[]): void {
    if (!this.hourlyChart) {
      console.error('Chart not initialized');
      return;
    }

    const labels = hourlyData.map((item: { slot_start: string | number | Date; slot_end: string | number | Date; }) => {
      const startDate = new Date(item.slot_start);
      const endDate = new Date(item.slot_end);

      const fmt = (d: Date) => {
        return d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      };
      return `${fmt(startDate)}-${fmt(endDate)}`;
    });

    const values = hourlyData.map((item: any) => item.count);
    const isCurrent = hourlyData.map((item: any) => item.is_current);

    const backgroundColors = values.map((val: number, idx: number) => {
      if (isCurrent[idx]) {
        return 'rgb(56, 189, 248)';
      }
      if (val >= 10) return 'rgb(255, 99, 132)';
      if (val >= 5) return 'rgb(255, 206, 86)';
      return 'rgb(54, 162, 235)';
    });

    const borderColors = values.map((_: any, idx: number) =>
      isCurrent[idx] ? 'rgb(255, 255, 255)' : 'transparent'
    );

    const borderWidths = values.map((_: any, idx: number) =>
      isCurrent[idx] ? 2 : 0
    );

    this.hourlyChart.data.labels = labels;
    this.hourlyChart.data.datasets[0].data = values;
    this.hourlyChart.data.datasets[0].backgroundColor = backgroundColors;
    this.hourlyChart.data.datasets[0].borderColor = borderColors;
    this.hourlyChart.data.datasets[0].borderWidth = borderWidths;

    this.hourlyChart.update('active');
    console.log('Chart updated with', values.length, 'slots');

  }

  loadPredictiveMetrics(): void {
    this.http.get<any>('http://localhost:5000/api/analytics/predictive-simple').subscribe({
      next: (data) => {
        this.predictiveMetrics = data;
      },
      error: (error) => {
        console.error('Error loading predictive metrics:', error);
      }
    });
  }

  loadRecommendations(): void {
    this.http.get<{ recommendations: Recommendation[] }>(`${this.aiApiUrl}/recommendations`).subscribe({
      next: (response) => {
        this.recommendations = response.recommendations;
      },
      error: (error) => {
        console.error('Error loading recommendations:', error);
      }
    });
  }

  loadIncidentForest(): void {
    this.http.get(`${this.aiApiUrl}/analytics/incident-forest`).subscribe({
      next: (data) => {
        this.forestData = data;
      },
      error: (error) => {
        console.error('Error loading incident forest:', error);
      }
    });
  }

  applyRecommendation(rec: Recommendation): void {
    if (rec.action === 'none') {
      return;
    }

    rec.applying = true;

    this.http.post(`${this.aiApiUrl}/recommendations/${rec.id}/apply`, { action: rec.action }).subscribe({
      next: (response: any) => {
        rec.applying = false;
        alert(response.message || 'Recommendation applied successfully!');

        if (rec.action === 'review_critical') {
          this.router.navigate(['/incidents'], { queryParams: { severity: 'CRITICAL' } });
        } else if (rec.action === 'review_alerts') {
          this.router.navigate(['/alerts']);
        } else if (rec.action === 'assign_incidents') {
          this.router.navigate(['/incidents'], { queryParams: { unassigned: 'true' } });
        } else if (rec.action === 'review_stale') {
          this.router.navigate(['/incidents'], { queryParams: { stale: 'true' } });
        }

        setTimeout(() => this.loadRecommendations(), 2000);
      },
      error: (error) => {
        rec.applying = false;
        console.error('Error applying recommendation:', error);
        alert('Failed to apply recommendation: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }
}