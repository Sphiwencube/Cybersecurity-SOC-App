import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { User, CreateUserRequest } from '../../models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-page">
      <div class="page-header" data-aos="fade-down">
        <h2>User Management</h2>
        <button class="btn btn-primary" (click)="showAddUserModal = true">
          <i class="fas fa-plus"></i> Add User
        </button>
      </div>
      
      <div class="users-table-card" data-aos="fade-up">
        <table class="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users; let i = index" [style.animation-delay]="i * 50 + 'ms'">
              <td>
                <div class="user-cell">
                  <img 
                    [src]="user.avatarUrl || getDefaultAvatar(user.username)" 
                    class="user-avatar-img"
                    [alt]="user.username"
                  />
                  <div class="user-info">
                    <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="role-badge" [class]="user.role.toLowerCase()">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class.active]="user.isActive">
                  <span class="status-dot" [class.active]="user.isActive"></span>
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="Edit" (click)="editUser(user)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon delete" title="Delete" (click)="deleteUser(user.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty-state" *ngIf="users.length === 0">
          <i class="fas fa-users"></i>
          <p>No users found</p>
        </div>
      </div>
      
      <!-- Add User Modal -->
      <div class="modal-overlay" *ngIf="showAddUserModal" (click)="showAddUserModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Add New User</h3>
            <button class="btn-icon" (click)="showAddUserModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="createUser()">
              <div class="form-group">
                <label>Username</label>
                <input type="text" [(ngModel)]="newUser.username" name="username" required />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="newUser.email" name="email" required />
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" [(ngModel)]="newUser.password" name="password" required />
              </div>
              <div class="form-group">
                <label>First Name</label>
                <input type="text" [(ngModel)]="newUser.firstName" name="firstName" />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" [(ngModel)]="newUser.lastName" name="lastName" />
              </div>
              <div class="form-group">
                <label>Role</label>
                <select [(ngModel)]="newUser.role" name="role">
                  <option value="VIEWER">VIEWER</option>
                  <option value="ANALYST">ANALYST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showAddUserModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="creatingUser">
                  <i class="fas fa-spinner fa-spin" *ngIf="creatingUser"></i>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .page-header h2 {
      font-size: 1.5rem;
    }
    
    .users-table-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
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
    
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    
    .user-avatar-img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      background: var(--secondary-bg);
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .user-email {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .role-badge.admin {
      background: rgba(239, 68, 68, 0.2);
      color: var(--accent-red);
    }
    
    .role-badge.analyst {
      background: rgba(59, 130, 246, 0.2);
      color: var(--accent-blue);
    }
    
    .role-badge.viewer {
      background: rgba(16, 185, 129, 0.2);
      color: var(--accent-green);
    }
    
    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    .status-badge.active {
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
    
    .btn-icon.delete:hover {
      border-color: var(--accent-red);
      color: var(--accent-red);
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
    
    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    .modal-header h3 {
      font-size: 1.25rem;
    }
    
    .modal-body {
      padding: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    
    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.625rem;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.875rem;
    }
    
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--accent-cyan);
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  showAddUserModal = false;
  creatingUser = false;
  
  newUser: CreateUserRequest = {
    username: '',
    email: '',
    password: '',
    role: 'VIEWER',
    firstName: '',
    lastName: ''
  };
  
  private apiUrl = 'http://localhost:8080/api/users';
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        alert('Failed to load users. Please check if you are logged in as ADMIN.');
      }
    });
  }
  
  getDefaultAvatar(username: string): string {
    return `https://ui-avatars.com/api/?name=${username}&background=random`;
  }
  
  createUser(): void {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.password) {
      alert('Please fill in all required fields');
      return;
    }
    
    this.creatingUser = true;
    this.http.post<User>(this.apiUrl, this.newUser).subscribe({
      next: () => {
        this.creatingUser = false;
        this.showAddUserModal = false;
        this.loadUsers();
        // Reset form
        this.newUser = {
          username: '',
          email: '',
          password: '',
          role: 'VIEWER',
          firstName: '',
          lastName: ''
        };
      },
      error: (error) => {
        this.creatingUser = false;
        console.error('Error creating user:', error);
        alert('Failed to create user: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }
  
  editUser(user: User): void {
    // For now, just alert. You can expand this to open an edit modal
    alert('Edit user functionality coming soon for: ' + user.username);
  }
  
  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        alert('Failed to delete user: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }
  
  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}