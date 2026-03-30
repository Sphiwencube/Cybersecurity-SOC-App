import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User, UpdateUserRequest } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="page-header">
        <h2>My Profile</h2>
      </div>
      
      <div class="profile-grid">
        <!-- Avatar Card -->
        <div class="profile-card avatar-card">
          <div class="avatar-section">
            <div class="avatar-wrapper" (click)="fileInput.click()">
              <img 
                [src]="getAvatarUrl()" 
                alt="Profile Avatar" 
                class="profile-avatar"
                (error)="onImageError($event)"
              />
              <div class="avatar-overlay">
                <i class="fas fa-camera"></i>
                <span>Change Photo</span>
              </div>
              <input 
                #fileInput
                type="file" 
                accept="image/*"
                (change)="onFileSelected($event)"
                style="display: none"
              />
            </div>
            
            <div class="upload-progress" *ngIf="uploadProgress > 0 && uploadProgress < 100">
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="uploadProgress"></div>
              </div>
              <span>{{ uploadProgress }}%</span>
            </div>
            
            <div class="avatar-actions">
              <button class="btn btn-secondary" (click)="fileInput.click()">
                <i class="fas fa-upload"></i> Choose File
              </button>
              <button class="btn btn-outline" (click)="setDefaultAvatar()">
                <i class="fas fa-undo"></i> Use Default
              </button>
            </div>
            
            <div class="avatar-hint">
              <small>Max size: 5MB. Formats: JPG, PNG, GIF</small>
            </div>
          </div>
        </div>
        
        <!-- Profile Info Card -->
        <div class="profile-card info-card">
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
        <div class="profile-card password-card">
          <div class="card-header">
            <h3><i class="fas fa-lock"></i> Change Password</h3>
          </div>
          <form (ngSubmit)="updatePassword()">
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
      max-width: 1200px;
    }
    
    .page-header h2 {
      font-size: 1.5rem;
      margin: 0;
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
      border-radius: 12px;
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
      width: 100%;
    }
    
    .avatar-wrapper {
      position: relative;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 3px solid var(--accent-cyan);
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
    
    .upload-progress {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .progress-bar {
      flex: 1;
      height: 6px;
      background: var(--border-color);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: var(--accent-cyan);
      transition: width 0.3s ease;
    }
    
    .avatar-actions {
      display: flex;
      gap: 0.5rem;
      width: 100%;
    }
    
    .avatar-actions button {
      flex: 1;
    }
    
    .avatar-hint {
      color: var(--text-muted);
      font-size: 0.75rem;
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
      margin: 0;
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
      border-radius: 8px;
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
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    
    .btn-primary {
      background: var(--accent-cyan);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #0891b2;
    }
    
    .btn-secondary {
      background: var(--secondary-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    
    .btn-secondary:hover:not(:disabled) {
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
    }
    
    .btn-outline {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }
    
    .btn-outline:hover:not(:disabled) {
      border-color: var(--accent-red);
      color: var(--accent-red);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .fa-spin {
      animation: fa-spin 1s linear infinite;
    }
    
    @keyframes fa-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  defaultAvatar = '';
  updating = false;
  updatingPassword = false;
  uploadProgress = 0;
  
  profileData: UpdateUserRequest = {};
  passwordData = {
    newPassword: '',
    confirmPassword: ''
  };
  
  private apiUrl = 'http://localhost:8080/api/users';
  private uploadUrl = 'http://localhost:8080/api/upload';
  
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
  
  getAvatarUrl(): string {
    if (this.user?.avatarUrl) {
      // If it's a full URL or starts with http, use as is
      if (this.user.avatarUrl.startsWith('http')) {
        return this.user.avatarUrl;
      }
      // Otherwise, prepend the backend URL
      return `http://localhost:8080${this.user.avatarUrl}`;
    }
    return this.defaultAvatar;
  }
  
  onImageError(event: any): void {
    event.target.src = this.defaultAvatar;
  }
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }
    
    this.uploadFile(file);
  }
  
  uploadFile(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    
    this.uploadProgress = 0;
    
    // Simulate progress (since HttpClient doesn't easily expose upload progress without extra config)
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 100);
    
    this.http.post(`${this.uploadUrl}/avatar`, formData).subscribe({
      next: (response: any) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        
        if (this.user) {
          this.user.avatarUrl = response.avatarUrl;
          this.updateLocalUser();
        }
        
        // Reset progress after a delay
        setTimeout(() => {
          this.uploadProgress = 0;
        }, 1000);
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.uploadProgress = 0;
        console.error('Error uploading avatar:', error);
        alert('Failed to upload avatar: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }
  
  setDefaultAvatar(): void {
    if (this.user) {
      const defaultUrl = `https://ui-avatars.com/api/?name=${this.user.username}&background=random`;
      this.http.put(`${this.apiUrl}/me/avatar`, { avatarUrl: defaultUrl }).subscribe({
        next: (response: any) => {
          this.user!.avatarUrl = response.avatarUrl;
          this.updateLocalUser();
        },
        error: (error) => {
          console.error('Error resetting avatar:', error);
        }
      });
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
        this.passwordData = { newPassword: '', confirmPassword: '' };
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