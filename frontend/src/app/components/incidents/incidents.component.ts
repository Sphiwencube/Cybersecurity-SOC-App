import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../services/incident.service';
import { Incident } from '../../models/incident.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="incidents-page">
      <!-- Header Actions -->
      <div class="page-header" data-aos="fade-down">
        <div class="header-filters">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              (input)="filterIncidents()"
              placeholder="Search incidents..."
            />
          </div>
          <select [(ngModel)]="severityFilter" (change)="filterIncidents()" class="filter-select">
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select [(ngModel)]="statusFilter" (change)="filterIncidents()" class="filter-select">
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <button *ngIf="canCreate()" class="btn btn-primary" (click)="showCreateModal = true">
          <i class="fas fa-plus"></i> New Incident
        </button>
      </div>
      
      <!-- Incidents Table -->
      <div class="table-card" data-aos="fade-up">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Type</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let incident of filteredIncidents; let i = index" 
                  [style.animation-delay]="i * 50 + 'ms'"
                  class="table-row">
                <td class="mono">{{ incident.incidentId }}</td>
                <td>
                  <a [routerLink]="['/incidents', incident.id]" class="incident-link">
                    {{ incident.title }}
                  </a>
                </td>
                <td>
                  <span class="badge" [class]="'badge-' + incident.severity.toLowerCase()">
                    {{ incident.severity }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class]="incident.status.toLowerCase()">
                    {{ incident.status.replace('_', ' ') }}
                  </span>
                </td>
                <td>{{ incident.incidentType || 'N/A' }}</td>
                <td>{{ incident.assignedToName || 'Unassigned' }}</td>
                <td>{{ formatDate(incident.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" [routerLink]="['/incidents', incident.id]" title="View">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button *ngIf="canEdit()" class="btn-icon edit" (click)="editIncident(incident)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button *ngIf="canDelete()" class="btn-icon delete" (click)="deleteIncident(incident.id)" title="Delete">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredIncidents.length === 0">
                <td colspan="8" class="empty-cell">
                  <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No incidents found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Create/Edit Modal -->
      <div class="modal-overlay" *ngIf="showCreateModal || showEditModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()" data-aos="zoom-in">
          <div class="modal-header">
            <h3>{{ showEditModal ? 'Edit Incident' : 'Create New Incident' }}</h3>
            <button class="close-btn" (click)="closeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form (ngSubmit)="saveIncident()" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Title *</label>
                <input type="text" [(ngModel)]="incidentForm.title" name="title" required />
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="incidentForm.description" name="description" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Severity</label>
                <select [(ngModel)]="incidentForm.severity" name="severity">
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                  <option value="INFO">Info</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select [(ngModel)]="incidentForm.status" name="status">
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Incident Type</label>
                <input type="text" [(ngModel)]="incidentForm.incidentType" name="incidentType" />
              </div>
              <div class="form-group">
                <label>Attack Vector</label>
                <input type="text" [(ngModel)]="incidentForm.attackVector" name="attackVector" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Source IP</label>
                <input type="text" [(ngModel)]="incidentForm.sourceIp" name="sourceIp" />
              </div>
              <div class="form-group">
                <label>Destination IP</label>
                <input type="text" [(ngModel)]="incidentForm.destinationIp" name="destinationIp" />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                {{ showEditModal ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .incidents-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .header-filters {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
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
    
    .filter-select {
      padding: 0.625rem 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.875rem;
      cursor: pointer;
    }
    
    .filter-select:focus {
      outline: none;
      border-color: var(--accent-cyan);
    }
    
    .table-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .table th {
      background: var(--secondary-bg);
      padding: 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }
    
    .table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.875rem;
    }
    
    .table-row {
      animation: fadeInUp 0.3s ease forwards;
      opacity: 0;
    }
    
    .table-row:hover {
      background: var(--secondary-bg);
    }
    
    .incident-link {
      color: var(--accent-cyan);
      font-weight: 500;
    }
    
    .incident-link:hover {
      text-decoration: underline;
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
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
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn-icon {
      width: 32px;
      height: 32px;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .btn-icon:hover {
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
    }
    
    .btn-icon.edit:hover {
      border-color: var(--accent-yellow);
      color: var(--accent-yellow);
    }
    
    .btn-icon.delete:hover {
      border-color: var(--accent-red);
      color: var(--accent-red);
    }
    
    .empty-cell {
      text-align: center;
      padding: 3rem;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--text-muted);
    }
    
    .empty-state i {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    
    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }
    
    .modal {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      animation: zoomIn 0.2s ease;
    }
    
    @keyframes zoomIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    .modal-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.25rem;
      cursor: pointer;
      transition: color 0.2s;
    }
    
    .close-btn:hover {
      color: var(--accent-red);
    }
    
    .modal-form {
      padding: 1.5rem;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.625rem 0.875rem;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.875rem;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--accent-cyan);
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class IncidentsComponent implements OnInit {
  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];
  searchTerm = '';
  severityFilter = '';
  statusFilter = '';
  
  showCreateModal = false;
  showEditModal = false;
  editingIncidentId: number | null = null;
  
  incidentForm: Partial<Incident> = {
    title: '',
    description: '',
    severity: 'MEDIUM',
    status: 'OPEN',
    incidentType: '',
    attackVector: '',
    sourceIp: '',
    destinationIp: ''
  };
  
  constructor(
    private incidentService: IncidentService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadIncidents();
  }
  
  loadIncidents(): void {
    this.incidentService.getAllIncidents().subscribe({
      next: (incidents) => {
        this.incidents = incidents;
        this.filterIncidents();
      },
      error: (error) => {
        console.error('Error loading incidents:', error);
      }
    });
  }
  
  filterIncidents(): void {
    this.filteredIncidents = this.incidents.filter(incident => {
      const matchesSearch = !this.searchTerm || 
        incident.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        incident.incidentId.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesSeverity = !this.severityFilter || incident.severity === this.severityFilter;
      const matchesStatus = !this.statusFilter || incident.status === this.statusFilter;
      
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }
  
  editIncident(incident: Incident): void {
    this.incidentForm = { ...incident };
    this.editingIncidentId = incident.id;
    this.showEditModal = true;
  }
  
  saveIncident(): void {
    if (this.showEditModal && this.editingIncidentId) {
      this.incidentService.updateIncident(this.editingIncidentId, this.incidentForm).subscribe({
        next: () => {
          this.loadIncidents();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating incident:', error);
        }
      });
    } else {
      this.incidentService.createIncident(this.incidentForm).subscribe({
        next: () => {
          this.loadIncidents();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating incident:', error);
        }
      });
    }
  }
  
  deleteIncident(id: number): void {
    if (confirm('Are you sure you want to delete this incident?')) {
      this.incidentService.deleteIncident(id).subscribe({
        next: () => {
          this.loadIncidents();
        },
        error: (error) => {
          console.error('Error deleting incident:', error);
        }
      });
    }
  }
  
  closeModal(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.editingIncidentId = null;
    this.incidentForm = {
      title: '',
      description: '',
      severity: 'MEDIUM',
      status: 'OPEN',
      incidentType: '',
      attackVector: '',
      sourceIp: '',
      destinationIp: ''
    };
  }
  
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  canCreate(): boolean {
    return this.authService.isAnalyst();
  }
  
  canEdit(): boolean {
    return this.authService.isAnalyst();
  }
  
  canDelete(): boolean {
    return this.authService.isAdmin();
  }
}
