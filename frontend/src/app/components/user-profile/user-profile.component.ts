import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { User, UpdateUserRequest } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="page-header" data-aos="fade-down">
        <h2>My Profile</h2>
      </div>
      
      <div class="profile-grid">
        <!-- Avatar Card -->
        <div class="profile-card avatar-card" data-aos="fade-up">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img 
                [src]="user?.avatarUrl || defaultAvatar" 
                alt="Profile Avatar" 
                class="profile-avatar"
              />
              <div class="avatar-overlay" (click)="triggerFileInput()">
                <i class="fas fa-camera"></i>
                <span>Change Photo</span>
              </div>
            </div>
            <input 
              type="file" 
              #fileInput 
              style="display: none" 
              accept="image/*"
              (change)="onFileSelected($event)"
            />
            <h3 class="user-name">{{ user?.firstName }} {{ user?.lastName }}</h3>
            <span class="user-role" [class]="user?.role?.toLowerCase()">{{ user?.role }}</span>
          </div>
          <div class="avatar-actions">
            <button class="btn btn-secondary" (click)="setDefaultAvatar()">
              Use Default Avatar
            </button>
          </div>
        </div>
        
        <!-- Profile Info Card -->
        <div class="profile-card info-card" data-aos="fade-up" data-aos-delay="100">
          <div class="card-header">
            <h3><i class="fas fa-user-edit"></i> Profile Information</h3>
          </div>
          <form (ngSubmit)="updateProfile()">
            <div class="form-row">
              <div class="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  [(ngModel)]="profileData.username" 
                  name="username"
                  [disabled]="updating"
                />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  [(ngModel)]="profileData.email" 
                  name="email"
                  [disabled]="updating"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  [(ngModel)]="profileData.firstName" 
                  name="firstName"
                  [disabled]="updating"
                />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  [(ngModel)]="profileData.lastName" 
                  name="lastName"
                  [disabled]="updating"
                />
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="updating">
                <i class="fas fa-spinner fa-spin" *ngIf="updating"></i>
                Save Changes
              </button>
            </div>
          </form>
        </div>
        
        <!-- Password Card -->
        <div class="profile-card password-card" data-aos="fade-up" data-aos-delay="200">
          <div class="card-header">
            <h3><i class="fas fa-lock"></i> Change Password</h3>
          </div>
          <form (ngSubmit)="updatePassword()">
            <div class="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                [(ngModel)]="passwordData.currentPassword" 
                name="currentPassword"
                placeholder="Enter current password"
                [disabled]="updatingPassword"
              />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                [(ngModel)]="passwordData.newPassword" 
                name="newPassword"
                placeholder="Enter new password"
                [disabled]="updatingPassword"
              />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                [(ngModel)]="passwordData.confirmPassword" 
                name="confirmPassword"
                placeholder="Confirm new password"
                [disabled]="updatingPassword"
              />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="updatingPassword">
                <i class="fas fa-spinner fa-spin" *ngIf="updatingPassword"></i>
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .page-header h2 {
      font-size: 1.5rem;
    }
    
    .profile-grid {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 1.5rem;
    }
    
    @media (max-width: 1024px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .profile-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }
    
    .avatar-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      height: fit-content;
    }
    
    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .avatar-wrapper {
      position: relative;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
    }
    
    .profile-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .avatar-wrapper:hover .profile-avatar {
      transform: scale(1.1);
    }
    
    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .avatar-wrapper:hover .avatar-overlay {
      opacity: 1;
    }
    
    .avatar-overlay i {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .avatar-overlay span {
      font-size: 0.75rem;
    }
    
    .user-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .user-role {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .user-role.admin {
      background: rgba(239, 68, 68, 0.2);
      color: var(--accent-red);
    }
    
    .user-role.analyst {
      background: rgba(59, 130, 246, 0.2);
      color: var(--accent-blue);
    }
    
    .user-role.viewer {
      background: rgba(16, 185, 129, 0.2);
      color: var(--accent-green);
    }
    
    .avatar-actions {
      width: 100%;
    }
    
    .avatar-actions button {
      width: 100%;
    }
    
    .info-card {
      grid-column: 2;
      grid-row: 1 / 3;
    }
    
    @media (max-width: 1024px) {
      .info-card {
        grid-column: 1;
        grid-row: auto;
      }
    }
    
    .card-header {
      margin-bottom: 1.5rem;
    }
    
    .card-header h3 {
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-primary);
    }
    
    .card-header h3 i {
      color: var(--accent-cyan);
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
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    
    .form-group input {
      width: 100%;
      padding: 0.625rem;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: var(--accent-cyan);
    }
    
    .form-group input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .form-actions {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }
    
    .password-card {
      grid-column: 2;
    }
    
    @media (max-width: 1024px) {
      .password-card {
        grid-column: 1;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  defaultAvatar = '';
  updating = false;
  updatingPassword = false;
  
  profileData: UpdateUserRequest = {};
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  private apiUrl = 'http://localhost:8080/api/users';
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadUserProfile();
  }
  
  loadUserProfile(): void {
    this.http.get<User>(`${this.apiUrl}/me`).subscribe({
      next: (user) => {
        this.user = user;
        this.defaultAvatar = `https://ui-avatars.com/api/?name=${user.username}&background=random`;
        this.profileData = {
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        };
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }
  
  triggerFileInput(): void {
    // In a real app, you'd handle file upload to a server/cloud storage
    // For now, we'll simulate with a URL input
    const url = prompt('Enter image URL (or leave empty for default):');
    if (url !== null) {
      if (url === '') {
        this.setDefaultAvatar();
      } else {
        this.updateAvatar(url);
      }
    }
  }
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // In production, upload file to server and get URL
      // For demo, we'll use a data URL or default
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.updateAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
  
  updateAvatar(url: string): void {
    this.http.put(`${this.apiUrl}/me/avatar`, { avatarUrl: url }).subscribe({
      next: (response: any) => {
        if (this.user) {
          this.user.avatarUrl = response.avatarUrl;
        }
        this.updateLocalUser();
      },
      error: (error) => {
        console.error('Error updating avatar:', error);
        alert('Failed to update avatar');
      }
    });
  }
  
  setDefaultAvatar(): void {
    if (this.user) {
      const defaultUrl = `https://ui-avatars.com/api/?name=${this.user.username}&background=random`;
      this.updateAvatar(defaultUrl);
    }
  }
  
  updateProfile(): void {
    this.updating = true;
    this.http.put<User>(`${this.apiUrl}/me`, this.profileData).subscribe({
      next: (user) => {
        this.updating = false;
        this.user = user;
        this.updateLocalUser();
        alert('Profile updated successfully!');
      },
      error: (error) => {
        this.updating = false;
        console.error('Error updating profile:', error);
        alert('Failed to update profile: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }
  
  updatePassword(): void {
    if (!this.passwordData.newPassword) {
      alert('Please enter a new password');
      return;
    }
    
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    this.updatingPassword = true;
    this.http.put(`${this.apiUrl}/me`, { password: this.passwordData.newPassword }).subscribe({
      next: () => {
        this.updatingPassword = false;
        this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        alert('Password updated successfully!');
      },
      error: (error) => {
        this.updatingPassword = false;
        console.error('Error updating password:', error);
        alert('Failed to update password: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }
  
  private updateLocalUser(): void {
    if (this.user) {
      localStorage.setItem('user', JSON.stringify(this.user));
      this.authService['currentUserSubject'].next(this.user);
    }
  }
}