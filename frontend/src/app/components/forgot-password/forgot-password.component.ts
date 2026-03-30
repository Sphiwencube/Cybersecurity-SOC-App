import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type Step = 'email' | 'otp' | 'reset' | 'success';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="forgot-password-container">
      <div class="cyber-background">
        <div class="grid-overlay"></div>
        <div class="floating-particles">
          <div class="particle" *ngFor="let i of [1,2,3,4,5,6,7,8,9,10]"></div>
        </div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        <div class="glow-orb orb-3"></div>
      </div>
      
      <div class="forgot-card" data-aos="zoom-in">
        <!-- Step 1: Enter Email -->
        <div *ngIf="currentStep === 'email'">
          <div class="logo-section">
            <div class="logo-icon">
              <i class="fas fa-key"></i>
            </div>
            <h1 class="logo-title">Forgot<span class="highlight">Password</span></h1>
            <p class="logo-subtitle">Enter your email to receive OTP</p>
          </div>
          
          <form (ngSubmit)="requestOtp()" class="forgot-form">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-envelope"></i> Email Address
              </label>
              <input 
                type="email" 
                class="form-input"
                [(ngModel)]="email"
                name="email"
                placeholder="Enter your registered email"
                required
              />
            </div>
            
            <div class="error-message" *ngIf="errorMessage">
              <i class="fas fa-exclamation-circle"></i>
              {{ errorMessage }}
            </div>
            
            <button type="submit" class="btn btn-primary btn-submit" [disabled]="isLoading">
              <span *ngIf="!isLoading">
                <i class="fas fa-paper-plane"></i> Send OTP
              </span>
              <span *ngIf="isLoading" class="loading-spinner">
                <div class="spinner spinner-sm"></div>
                Sending...
              </span>
            </button>
          </form>
        </div>
        
        <!-- Step 2: Enter OTP -->
        <div *ngIf="currentStep === 'otp'">
          <div class="logo-section">
            <div class="logo-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <h1 class="logo-title">Verify<span class="highlight">OTP</span></h1>
            <p class="logo-subtitle">Enter the 6-digit code sent to {{ email }}</p>
          </div>
          
          <form (ngSubmit)="verifyOtp()" class="forgot-form">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-hashtag"></i> OTP Code
              </label>
              <input 
                type="text" 
                class="form-input otp-input"
                [(ngModel)]="otpCode"
                name="otpCode"
                placeholder="000000"
                maxlength="6"
                required
              />
            </div>
            
            <div class="otp-timer" *ngIf="otpTimer > 0">
              <i class="fas fa-clock"></i>
              OTP expires in {{ formatTime(otpTimer) }}
            </div>
            
            <div class="otp-timer expired" *ngIf="otpTimer === 0">
              <i class="fas fa-exclamation-triangle"></i>
              OTP expired. Please request a new one.
            </div>
            
            <div class="error-message" *ngIf="errorMessage">
              <i class="fas fa-exclamation-circle"></i>
              {{ errorMessage }}
            </div>
            
            <button type="submit" class="btn btn-primary btn-submit" [disabled]="isLoading || otpTimer === 0">
              <span *ngIf="!isLoading">
                <i class="fas fa-check"></i> Verify OTP
              </span>
              <span *ngIf="isLoading" class="loading-spinner">
                <div class="spinner spinner-sm"></div>
                Verifying...
              </span>
            </button>
            
            <button type="button" class="btn btn-link" (click)="currentStep = 'email'">
              <i class="fas fa-arrow-left"></i> Back to Email
            </button>
          </form>
        </div>
        
        <!-- Step 3: Reset Password -->
        <div *ngIf="currentStep === 'reset'">
          <div class="logo-section">
            <div class="logo-icon">
              <i class="fas fa-lock"></i>
            </div>
            <h1 class="logo-title">Reset<span class="highlight">Password</span></h1>
            <p class="logo-subtitle">Create a new password</p>
          </div>
          
          <form (ngSubmit)="resetPassword()" class="forgot-form">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-lock"></i> New Password
              </label>
              <div class="password-input">
                <input 
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-input"
                  [(ngModel)]="newPassword"
                  name="newPassword"
                  placeholder="Enter new password"
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
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm new password"
                required
              />
            </div>
            
            <div class="error-message" *ngIf="errorMessage">
              <i class="fas fa-exclamation-circle"></i>
              {{ errorMessage }}
            </div>
            
            <button type="submit" class="btn btn-primary btn-submit" [disabled]="isLoading">
              <span *ngIf="!isLoading">
                <i class="fas fa-save"></i> Reset Password
              </span>
              <span *ngIf="isLoading" class="loading-spinner">
                <div class="spinner spinner-sm"></div>
                Resetting...
              </span>
            </button>
          </form>
        </div>
        
        <!-- Step 4: Success -->
        <div *ngIf="currentStep === 'success'" class="success-step">
          <div class="logo-section">
            <div class="logo-icon success">
              <i class="fas fa-check-circle"></i>
            </div>
            <h1 class="logo-title">Success!</h1>
            <p class="logo-subtitle">Your password has been reset</p>
          </div>
          
          <div class="success-content">
            <p class="success-text">
              You can now log in with your new password.
            </p>
            <button class="btn btn-primary btn-submit" routerLink="/login">
              <i class="fas fa-sign-in-alt"></i> Go to Login
            </button>
          </div>
        </div>
        
        <div class="forgot-footer" *ngIf="currentStep !== 'success'">
          <a routerLink="/login" class="back-link">
            <i class="fas fa-arrow-left"></i> Back to Login
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-password-container {
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
    .forgot-card {
      position: relative;
      z-index: 10;
      background: rgba(26, 31, 46, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 2.5rem;
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
    .forgot-form {
      margin-bottom: 1rem;
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
    .otp-input {
      font-size: 1.5rem;
      letter-spacing: 0.5rem;
      text-align: center;
      font-family: monospace;
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
    .otp-timer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: rgba(0, 212, 255, 0.1);
      border-radius: var(--radius-md);
      color: var(--accent-cyan);
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .otp-timer.expired {
      background: rgba(239, 68, 68, 0.1);
      color: var(--accent-red);
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
    .btn-submit {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    .btn-link {
      width: 100%;
      padding: 0.75rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.875rem;
      cursor: pointer;
      transition: color 0.2s;
    }
    .btn-link:hover {
      color: var(--accent-cyan);
    }
    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }
    .success-step {
      text-align: center;
    }
    .success-content {
      padding: 1rem 0;
    }
    .success-text {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }
    .forgot-footer {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }
    .back-link {
      color: var(--accent-cyan);
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .back-link:hover {
      text-decoration: underline;
    }
  `]
})
export class ForgotPasswordComponent {
  currentStep: Step = 'email';
  email = '';
  otpCode = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  otpTimer = 600;
  private timerInterval: any;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  requestOtp(): void {
    if (!this.email || !this.email.includes('@')) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 'otp';
        this.startOtpTimer();
      },
      error: () => {
        this.isLoading = false;
        this.currentStep = 'otp';
        this.startOtpTimer();
      }
    });
  }
  
  verifyOtp(): void {
    if (!this.otpCode || this.otpCode.length !== 6) {
      this.errorMessage = 'Please enter the 6-digit OTP code';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.verifyOtp(this.email, this.otpCode).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearTimer();
        this.currentStep = 'reset';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid OTP. Please try again.';
      }
    });
  }
  
  resetPassword(): void {
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.resetPassword(this.email, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 'success';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to reset password. Please try again.';
      }
    });
  }
  
  private startOtpTimer(): void {
    this.otpTimer = 600;
    this.timerInterval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) {
        this.clearTimer();
      }
    }, 1000);
  }
  
  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
  
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}