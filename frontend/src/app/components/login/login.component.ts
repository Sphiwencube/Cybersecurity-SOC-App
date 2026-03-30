import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="cyber-background">
        <div class="grid-overlay"></div>
        <div class="floating-particles">
          <div class="particle" *ngFor="let i of [1,2,3,4,5,6,7,8,9,10]"></div>
        </div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        <div class="glow-orb orb-3"></div>
      </div>
      
      <div class="login-card" data-aos="zoom-in" data-aos-duration="800">
        <div class="logo-section">
          <div class="logo-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h1 class="logo-title">SOC<span class="highlight">Guard</span></h1>
          <p class="logo-subtitle">Security Operations Center</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-user"></i> Username
            </label>
            <input 
              type="text" 
              class="form-input"
              [(ngModel)]="credentials.username"
              name="username"
              placeholder="Enter your username"
              required
              [class.error]="errorMessage"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-lock"></i> Password
            </label>
            <div class="password-input">
              <input 
                [type]="showPassword ? 'text' : 'password'"
                class="form-input"
                [(ngModel)]="credentials.password"
                name="password"
                placeholder="Enter your password"
                required
                [class.error]="errorMessage"
              />
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>
          
          <div class="forgot-password-link">
            <a routerLink="/forgot-password">Forgot Password?</a>
          </div>
          
          <div class="error-message" *ngIf="errorMessage">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn btn-primary btn-login" [disabled]="isLoading">
            <span *ngIf="!isLoading">
              <i class="fas fa-sign-in-alt"></i> Sign In
            </span>
            <span *ngIf="isLoading" class="loading-spinner">
              <div class="spinner spinner-sm"></div>
              Authenticating...
            </span>
          </button>
        </form>
        
        <div class="login-footer">
          <p class="register-prompt">
            Don't have an account? <a routerLink="/register" class="register-link">Create Account</a>
          </p>
        </div>
      </div>
      
      <div class="decoration-line line-1"></div>
      <div class="decoration-line line-2"></div>
      <div class="decoration-line line-3"></div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: var(--primary-bg);
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
    .login-card {
      position: relative;
      z-index: 10;
      background: rgba(26, 31, 46, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 3rem;
      width: 100%;
      max-width: 420px;
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
      margin-bottom: 2rem;
    }
    .logo-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1rem;
      background: var(--gradient-primary);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      color: white;
      animation: iconPulse 2s ease-in-out infinite;
    }
    @keyframes iconPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
      50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(0, 212, 255, 0.5); }
    }
    .logo-title {
      font-size: 2rem;
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
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .login-form {
      margin-bottom: 1.5rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
    }
    .form-label i {
      color: var(--accent-cyan);
    }
    .form-input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: var(--secondary-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.9375rem;
      transition: all 0.2s ease;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--accent-cyan);
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }
    .form-input.error {
      border-color: var(--accent-red);
    }
    .password-input {
      position: relative;
    }
    .toggle-password {
      position: absolute;
      right: 1rem;
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
    .forgot-password-link {
      text-align: right;
      margin-bottom: 1rem;
    }
    .forgot-password-link a {
      font-size: 0.875rem;
      color: var(--accent-cyan);
      text-decoration: none;
    }
    .forgot-password-link a:hover {
      text-decoration: underline;
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
    .btn-login {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 600;
    }
    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }
    .login-footer {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }
    .register-prompt {
      margin-bottom: 0.75rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    .register-link {
      color: var(--accent-cyan);
      font-weight: 600;
      text-decoration: none;
    }
    .register-link:hover {
      text-decoration: underline;
    }
    .decoration-line {
      position: absolute;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent-cyan), transparent);
      opacity: 0.3;
    }
    .line-1 {
      width: 200px;
      top: 20%;
      left: 10%;
      animation: lineMove 8s linear infinite;
    }
    .line-2 {
      width: 300px;
      top: 60%;
      right: 15%;
      animation: lineMove 10s linear infinite reverse;
    }
    .line-3 {
      width: 150px;
      bottom: 25%;
      left: 20%;
      animation: lineMove 6s linear infinite;
    }
    @keyframes lineMove {
      0% { transform: translateX(-100%); opacity: 0; }
      50% { opacity: 0.3; }
      100% { transform: translateX(100vw); opacity: 0; }
    }
    @media (max-width: 480px) {
      .login-card {
        margin: 1rem;
        padding: 2rem;
      }
      .logo-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };
  
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid credentials';
      }
    });
  }
}