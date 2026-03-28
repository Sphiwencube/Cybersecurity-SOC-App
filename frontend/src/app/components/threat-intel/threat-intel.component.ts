import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThreatIntelService } from '../../services/threat-intel.service';
import { ThreatIntelligence } from '../../models/threat-intel.model';

@Component({
  selector: 'app-threat-intel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="threat-intel-page">
      <div class="page-header" data-aos="fade-down">
        <h2>Threat Intelligence</h2>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            [(ngModel)]="searchTerm"
            (input)="filterIndicators()"
            placeholder="Search indicators..."
          />
        </div>
      </div>
      
      <div class="intel-grid">
        <div 
          class="intel-card" 
          *ngFor="let indicator of filteredIndicators; let i = index"
          [style.animation-delay]="i * 50 + 'ms'"
          data-aos="fade-up"
        >
          <div class="intel-header">
            <div class="indicator-type" [class]="indicator.indicatorType.toLowerCase()">
              <i [class]="getTypeIcon(indicator.indicatorType)"></i>
              {{ indicator.indicatorType }}
            </div>
            <div class="confidence-score" [class]="getConfidenceClass(indicator.confidenceScore)">
              {{ indicator.confidenceScore }}%
            </div>
          </div>
          
          <div class="indicator-value">
            <code>{{ indicator.indicator }}</code>
          </div>
          
          <div class="intel-details">
            <div class="detail-row">
              <span class="label">Threat Type:</span>
              <span class="value">{{ indicator.threatType || 'Unknown' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Source:</span>
              <span class="value">{{ indicator.source || 'Internal' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">First Seen:</span>
              <span class="value">{{ formatDate(indicator.firstSeen) }}</span>
            </div>
          </div>
          
          <div class="intel-status" [class.active]="indicator.isActive">
            <span class="status-dot" [class.active]="indicator.isActive"></span>
            {{ indicator.isActive ? 'Active' : 'Inactive' }}
          </div>
        </div>
      </div>
      
      <div class="empty-state" *ngIf="filteredIndicators.length === 0" data-aos="fade-up">
        <i class="fas fa-shield-alt"></i>
        <p>No threat indicators found</p>
      </div>
    </div>
  `,
  styles: [`
    .threat-intel-page {
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
    
    .search-box {
      position: relative;
      min-width: 280px;
    }
    
    .search-box i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
    
    .search-box input {
      width: 100%;
      padding: 0.625rem 1rem 0.625rem 2.5rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.875rem;
    }
    
    .search-box input:focus {
      outline: none;
      border-color: var(--accent-cyan);
    }
    
    .intel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }
    
    .intel-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      transition: all 0.3s ease;
      animation: fadeInUp 0.3s ease forwards;
      opacity: 0;
    }
    
    .intel-card:hover {
      border-color: var(--accent-cyan);
      transform: translateY(-2px);
      box-shadow: var(--shadow-glow);
    }
    
    .intel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    
    .indicator-type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-sm);
      background: var(--secondary-bg);
      color: var(--text-secondary);
    }
    
    .indicator-type.ip {
      color: var(--accent-cyan);
    }
    
    .indicator-type.domain {
      color: var(--accent-purple);
    }
    
    .indicator-type.hash {
      color: var(--accent-yellow);
    }
    
    .indicator-type.url {
      color: var(--accent-green);
    }
    
    .indicator-type.email {
      color: var(--accent-orange);
    }
    
    .confidence-score {
      font-size: 0.875rem;
      font-weight: 700;
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-sm);
    }
    
    .confidence-score.high {
      background: rgba(239, 68, 68, 0.2);
      color: var(--accent-red);
    }
    
    .confidence-score.medium {
      background: rgba(245, 158, 11, 0.2);
      color: var(--accent-yellow);
    }
    
    .confidence-score.low {
      background: rgba(16, 185, 129, 0.2);
      color: var(--accent-green);
    }
    
    .indicator-value {
      background: var(--secondary-bg);
      border-radius: var(--radius-md);
      padding: 0.875rem;
      margin-bottom: 1rem;
      overflow-x: auto;
    }
    
    .indicator-value code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      color: var(--accent-cyan);
      word-break: break-all;
    }
    
    .intel-details {
      margin-bottom: 1rem;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.375rem 0;
      font-size: 0.8125rem;
    }
    
    .label {
      color: var(--text-muted);
    }
    
    .value {
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .intel-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
    }
    
    .intel-status.active {
      color: var(--accent-green);
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-muted);
    }
    
    .status-dot.active {
      background: var(--accent-green);
      box-shadow: 0 0 8px var(--accent-green);
      animation: pulse 2s infinite;
    }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);
    }
    
    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  `]
})
export class ThreatIntelComponent implements OnInit {
  indicators: ThreatIntelligence[] = [];
  filteredIndicators: ThreatIntelligence[] = [];
  searchTerm = '';
  
  constructor(private threatIntelService: ThreatIntelService) {}
  
  ngOnInit(): void {
    this.loadIndicators();
  }
  
  loadIndicators(): void {
    this.threatIntelService.getAllIndicators().subscribe({
      next: (indicators) => {
        this.indicators = indicators;
        this.filterIndicators();
      },
      error: (error) => {
        console.error('Error loading threat intelligence:', error);
      }
    });
  }
  
  filterIndicators(): void {
    if (!this.searchTerm) {
      this.filteredIndicators = this.indicators;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredIndicators = this.indicators.filter(indicator =>
      indicator.indicator.toLowerCase().includes(term) ||
      indicator.threatType?.toLowerCase().includes(term) ||
      indicator.source?.toLowerCase().includes(term)
    );
  }
  
  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'IP': 'fas fa-network-wired',
      'DOMAIN': 'fas fa-globe',
      'URL': 'fas fa-link',
      'HASH': 'fas fa-fingerprint',
      'EMAIL': 'fas fa-envelope'
    };
    return icons[type] || 'fas fa-question';
  }
  
  getConfidenceClass(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }
  
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
