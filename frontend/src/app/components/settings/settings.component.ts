import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="page-header" data-aos="fade-down">
        <h2>System Settings</h2>
      </div>
      
      <div class="settings-grid">
        <div class="settings-card" data-aos="fade-up">
          <div class="card-header">
            <h3><i class="fas fa-bell"></i> Notifications</h3>
          </div>
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">Email Alerts</span>
                <span class="setting-desc">Receive email notifications for critical alerts</span>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="settings.emailAlerts">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">Push Notifications</span>
                <span class="setting-desc">Browser push notifications for new incidents</span>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="settings.pushNotifications">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">Slack Integration</span>
                <span class="setting-desc">Send alerts to Slack channel</span>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="settings.slackIntegration">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="settings-card" data-aos="fade-up" data-aos-delay="100">
          <div class="card-header">
            <h3><i class="fas fa-shield-alt"></i> Security</h3>
          </div>
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">Two-Factor Authentication</span>
                <span class="setting-desc">Require 2FA for all users</span>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="settings.twoFactorAuth">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">Session Timeout</span>
                <span class="setting-desc">Auto logout after 30 minutes</span>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="settings.sessionTimeout" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">IP Whitelist</span>
                <span class="setting-desc">Restrict access to specific IPs</span>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="settings.ipWhitelist">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="settings-card" data-aos="fade-up" data-aos-delay="200">
          <div class="card-header">
            <h3><i class="fas fa-database"></i> Data Retention</h3>
          </div>
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">Incident Retention</span>
                <span class="setting-desc">Keep incident data for 90 days</span>
              </div>
              <select class="setting-select" [(ngModel)]="settings.incidentRetention">
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">Log Retention</span>
                <span class="setting-desc">Keep audit logs for 1 year</span>
              </div>
              <select class="setting-select" [(ngModel)]="settings.logRetention">
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
                <option value="730">2 years</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="settings-card full-width" data-aos="fade-up" data-aos-delay="300">
          <div class="card-header">
            <h3><i class="fas fa-robot"></i> AI Configuration</h3>
          </div>
          <div class="ai-settings">
            <div class="ai-model-status">
              <div class="model-info">
                <span class="model-name">Threat Detection Model</span>
                <span class="model-version">v2.4.1</span>
              </div>
              <span class="model-status active">
                <span class="status-dot active"></span> Active
              </span>
            </div>
            <div class="ai-thresholds">
              <div class="threshold-item">
                <span class="threshold-label">Confidence Threshold</span>
                <input type="range" min="0" max="100" value="75" class="threshold-slider">
                <span class="threshold-value">75%</span>
              </div>
              <div class="threshold-item">
                <span class="threshold-label">Anomaly Sensitivity</span>
                <input type="range" min="0" max="100" value="60" class="threshold-slider">
                <span class="threshold-value">60%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-actions" data-aos="fade-up" data-aos-delay="400">
        <button class="btn btn-secondary">Reset to Defaults</button>
        <button class="btn btn-primary" (click)="saveSettings()">
          <i class="fas fa-save"></i> Save Changes
        </button>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .page-header h2 {
      font-size: 1.5rem;
    }
    
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .settings-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }
    
    .settings-card.full-width {
      grid-column: 1 / -1;
    }
    
    .card-header {
      margin-bottom: 1.5rem;
    }
    
    .card-header h3 {
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .card-header h3 i {
      color: var(--accent-cyan);
    }
    
    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    
    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .setting-info {
      display: flex;
      flex-direction: column;
    }
    
    .setting-name {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .setting-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    /* Toggle Switch */
    .toggle {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 24px;
    }
    
    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: var(--border-color);
      border-radius: 24px;
      transition: 0.3s;
    }
    
    .toggle-slider::before {
      content: '';
      position: absolute;
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: 0.3s;
    }
    
    .toggle input:checked + .toggle-slider {
      background: var(--accent-cyan);
    }
    
    .toggle input:checked + .toggle-slider::before {
      transform: translateX(24px);
    }
    
    .setting-select {
      padding: 0.5rem 1rem;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.875rem;
    }
    
    /* AI Settings */
    .ai-settings {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .ai-model-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: var(--secondary-bg);
      border-radius: var(--radius-md);
    }
    
    .model-info {
      display: flex;
      flex-direction: column;
    }
    
    .model-name {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .model-version {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .model-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    .model-status.active {
      color: var(--accent-green);
    }
    
    .ai-thresholds {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .threshold-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .threshold-label {
      min-width: 150px;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    
    .threshold-slider {
      flex: 1;
      height: 6px;
      background: var(--secondary-bg);
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
    }
    
    .threshold-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: var(--accent-cyan);
      border-radius: 50%;
      cursor: pointer;
    }
    
    .threshold-value {
      min-width: 50px;
      text-align: right;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .settings-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class SettingsComponent {
  settings = {
    emailAlerts: true,
    pushNotifications: false,
    slackIntegration: true,
    twoFactorAuth: true,
    sessionTimeout: true,
    ipWhitelist: false,
    incidentRetention: '90',
    logRetention: '365'
  };
  
  saveSettings(): void {
    alert('Settings saved successfully!');
  }
}
