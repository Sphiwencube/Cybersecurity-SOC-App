import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="cyber-background">
        <div class="grid-overlay"></div>
        <div class="floating-particles">
          <div class="particle" *ngFor="let i of [1,2,3,4,5,6,7,8,9,10]"></div>
        </div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        <div class="glow-orb orb-3"></div>
      </div>
      
      <!-- Success Message -->
      <div class="register-card" *ngIf="registrationSuccess" data-aos="zoom-in">
        <div class="logo-section">
          <div class="logo-icon success">
            <i class="fas fa-check-circle"></i>
          </div>
          <h1 class="logo-title">Registration<span class="highlight">Successful!</span></h1>
          <p class="logo-subtitle">Your account has been created</p>
        </div>
        
        <div class="success-content">
          <div class="success-icon">
            <i class="fas fa-user-check"></i>
          </div>
          <p class="success-text">
            Welcome to SOC Guard, <strong>{{ registeredUsername }}</strong>!
          </p>
          <p class="success-subtext">
            Your account is ready to use. You can now log in with your credentials.
          </p>
          
          <button class="btn btn-primary" (click)="goToLogin()">
            <i class="fas fa-sign-in-alt"></i> Go to Login
          </button>
        </div>
      </div>
      
      <!-- Registration Form -->
      <div class="register-card" *ngIf="!registrationSuccess" data-aos="zoom-in" data-aos-duration="800">
        <div class="logo-section">
          <div class="logo-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <h1 class="logo-title">Create<span class="highlight">Account</span></h1>
          <p class="logo-subtitle">Join SOC Guard Platform</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-user"></i> First Name
              </label>
              <input 
                type="text" 
                class="form-input"
                [(ngModel)]="registerData.firstName"
                name="firstName"
                placeholder="Enter first name"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-user"></i> Last Name
              </label>
              <input 
                type="text" 
                class="form-input"
                [(ngModel)]="registerData.lastName"
                name="lastName"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-id-card"></i> Username
            </label>
            <input 
              type="text" 
              class="form-input"
              [(ngModel)]="registerData.username"
              name="username"
              placeholder="Choose a username"
              required
              minlength="3"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-envelope"></i> Email
            </label>
            <input 
              type="email" 
              class="form-input"
              [(ngModel)]="registerData.email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-user-tag"></i> Select Role
            </label>
            <div class="role-selection">
              <label class="role-option" [class.selected]="registerData.role === 'VIEWER'">
                <input 
                  type="radio" 
                  [(ngModel)]="registerData.role"
                  name="role"
                  value="VIEWER"
                  required
                />
                <div class="role-content">
                  <i class="fas fa-eye"></i>
                  <span class="role-name">Viewer</span>
                  <span class="role-desc">Read-only access</span>
                </div>
              </label>
              <label class="role-option" [class.selected]="registerData.role === 'ANALYST'">
                <input 
                  type="radio" 
                  [(ngModel)]="registerData.role"
                  name="role"
                  value="ANALYST"
                  required
                />
                <div class="role-content">
                  <i class="fas fa-search"></i>
                  <span class="role-name">Analyst</span>
                  <span class="role-desc">Can manage incidents</span>
                </div>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-lock"></i> Password
            </label>
            <div class="password-input">
              <input 
                [type]="showPassword ? 'text' : 'password'"
                class="form-input"
                [(ngModel)]="registerData.password"
                name="password"
                placeholder="Create a password"
                required
                minlength="6"
              />
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-lock"></i> Confirm Password
            </label>
            <input 
              [type]="showPassword ? 'text' : 'password'"
              class="form-input"
              [(ngModel)]="registerData.confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
            />
          </div>
          
          <div class="error-message" *ngIf="errorMessage">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn btn-primary btn-register" [disabled]="isLoading">
            <span *ngIf="!isLoading">
              <i class="fas fa-user-plus"></i> Create Account
            </span>
            <span *ngIf="isLoading" class="loading-spinner">
              <div class="spinner spinner-sm"></div>
              Creating account...
            </span>
          </button>
        </form>
        
        <div class="register-footer">
          <p>Already have an account? <a routerLink="/login" class="login-link">Sign In</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: var(--primary-bg);
      padding: 2rem 1rem;
    }
    .cyber-background {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: gridMove 20s linear infinite;
    }
    @keyframes gridMove {
      0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
      100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
    }
    .floating-particles {
      position: absolute;
      inset: 0;
    }
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--accent-cyan);
      border-radius: 50%;
      opacity: 0.5;
      animation: float 15s infinite;
    }
    .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
    .particle:nth-child(2) { left: 20%; animation-delay: 1s; }
    .particle:nth-child(3) { left: 30%; animation-delay: 2s; }
    .particle:nth-child(4) { left: 40%; animation-delay: 3s; }
    .particle:nth-child(5) { left: 50%; animation-delay: 4s; }
    .particle:nth-child(6) { left: 60%; animation-delay: 5s; }
    .particle:nth-child(7) { left: 70%; animation-delay: 6s; }
    .particle:nth-child(8) { left: 80%; animation-delay: 7s; }
    .particle:nth-child(9) { left: 90%; animation-delay: 8s; }
    .particle:nth-child(10) { left: 95%; animation-delay: 9s; }
    @keyframes float {
      0%, 100% {
        transform: translateY(100vh) scale(0);
        opacity: 0;
      }
      10% { opacity: 0.5; }
      90% { opacity: 0.5; }
      100% {
        transform: translateY(-100vh) scale(1);
        opacity: 0;
      }
    }
    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: orbFloat 10s ease-in-out infinite;
    }
    .orb-1 {
      width: 400px;
      height: 400px;
      background: var(--accent-cyan);
      top: -100px;
      left: -100px;
    }
    .orb-2 {
      width: 300px;
      height: 300px;
      background: var(--accent-purple);
      bottom: -50px;
      right: -50px;
      animation-delay: -3s;
    }
    .orb-3 {
      width: 200px;
      height: 200px;
      background: var(--accent-blue);
      top: 50%;
      left: 50%;
      animation-delay: -6s;
    }
    @keyframes orbFloat {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }
    .register-card {
      position: relative;
      z-index: 10;
      background: rgba(26, 31, 46, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(0, 212, 255, 0.1);
      animation: cardGlow 3s ease-in-out infinite;
    }
    @keyframes cardGlow {
      0%, 100% { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 212, 255, 0.1); }
      50% { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 255, 0.2); }
    }
    .logo-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .logo-icon {
      width: 70px;
      height: 70px;
      margin: 0 auto 0.75rem;
      background: var(--gradient-primary);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: white;
      animation: iconPulse 2s ease-in-out infinite;
    }
    .logo-icon.success {
      background: linear-gradient(135deg, #10b981, #059669);
      animation: iconPulseSuccess 2s ease-in-out infinite;
    }
    @keyframes iconPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
      50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(0, 212, 255, 0.5); }
    }
    @keyframes iconPulseSuccess {
      0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
      50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(16, 185, 129, 0.5); }
    }
    .logo-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }
    .highlight {
      color: var(--accent-cyan);
    }
    .logo-subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    /* Success content styles */
    .success-content {
      text-align: center;
      padding: 1.5rem 0;
    }
    .success-icon {
      font-size: 4rem;
      color: var(--accent-green, #10b981);
      margin-bottom: 1.5rem;
      animation: floatIcon 3s ease-in-out infinite;
    }
    @keyframes floatIcon {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .success-text {
      font-size: 1.1rem;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }
    .success-text strong {
      color: var(--accent-cyan);
    }
    .success-subtext {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .success-content .btn-primary {
      margin-top: 1rem;
    }
    .register-form {
      margin-bottom: 1rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 480px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary);
    }
    .form-label i {
      color: var(--accent-cyan);
      font-size: 0.875rem;
    }
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--accent-cyan);
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }
    .password-input {
      position: relative;
    }
    .toggle-password {
      position: absolute;
      right: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      transition: color 0.2s;
    }
    .toggle-password:hover {
      color: var(--accent-cyan);
    }
    .role-selection {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    @media (max-width: 480px) {
      .role-selection {
        grid-template-columns: 1fr;
      }
    }
    .role-option {
      position: relative;
      cursor: pointer;
    }
    .role-option input {
      position: absolute;
      opacity: 0;
    }
    .role-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375rem;
      padding: 1rem;
      background: var(--secondary-bg);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
      text-align: center;
    }
    .role-option:hover .role-content {
      border-color: var(--border-light);
    }
    .role-option.selected .role-content {
      border-color: var(--accent-cyan);
      background: rgba(0, 212, 255, 0.1);
    }
    .role-content i {
      font-size: 1.5rem;
      color: var(--accent-cyan);
    }
    .role-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }
    .role-desc {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--accent-red);
      border-radius: var(--radius-md);
      color: var(--accent-red);
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .btn-register {
      width: 100%;
      padding: 0.875rem;
      font-size: 0.9375rem;
      font-weight: 600;
    }
    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }
    .register-footer {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }
    .register-footer p {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    .login-link {
      color: var(--accent-cyan);
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .login-link:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  registerData: RegisterRequest & { confirmPassword?: string } = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'VIEWER',
    firstName: '',
    lastName: ''
  };
  
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  registrationSuccess = false;
  registeredUsername = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  onSubmit(): void {
    this.errorMessage = '';
    
    if (!this.registerData.username || !this.registerData.email || 
        !this.registerData.password || !this.registerData.firstName || 
        !this.registerData.lastName) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }
    
    if (this.registerData.username.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters';
      return;
    }
    
    if (this.registerData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }
    
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    
    if (!this.registerData.role) {
      this.errorMessage = 'Please select a role';
      return;
    }
    
    this.isLoading = true;
    
    const { confirmPassword, ...registerRequest } = this.registerData;
    
    this.authService.register(registerRequest).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.registeredUsername = this.registerData.username;
        this.registrationSuccess = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
  
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}