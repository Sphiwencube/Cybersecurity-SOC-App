import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="verification-container">
      <div class="cyber-background">
        <div class="grid-overlay"></div>
        <div class="floating-particles">
          <div class="particle" *ngFor="let i of [1,2,3,4,5,6,7,8,9,10]"></div>
        </div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        <div class="glow-orb orb-3"></div>
      </div>
      
      <div class="verification-card" data-aos="zoom-in">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="state-container">
          <div class="spinner-container">
            <div class="spinner spinner-lg"></div>
          </div>
          <h2>Verifying your email...</h2>
          <p>Please wait while we verify your email address.</p>
        </div>
        
        <!-- Success State -->
        <div *ngIf="!isLoading && isSuccess" class="state-container success">
          <div class="icon-container success">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>Email Verified!</h2>
          <p>Your email has been successfully verified. You can now log in to your account.</p>
          <button class="btn btn-primary" routerLink="/login">
            <i class="fas fa-sign-in-alt"></i> Go to Login
          </button>
        </div>
        
        <!-- Error State -->
        <div *ngIf="!isLoading && !isSuccess" class="state-container error">
          <div class="icon-container error">
            <i class="fas fa-times-circle"></i>
          </div>
          <h2>Verification Failed</h2>
          <p>{{ errorMessage }}</p>
          <button class="btn btn-primary" routerLink="/register">
            <i class="fas fa-user-plus"></i> Back to Registration
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verification-container {
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
    .verification-card {
      position: relative;
      z-index: 10;
      background: rgba(26, 31, 46, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 3rem;
      width: 100%;
      max-width: 450px;
      text-align: center;
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(0, 212, 255, 0.1);
    }
    .state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }
    .spinner-container {
      margin-bottom: 1rem;
    }
    .icon-container {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    .icon-container.success {
      background: rgba(16, 185, 129, 0.1);
      color: var(--accent-green);
      animation: successPulse 2s ease-in-out infinite;
    }
    .icon-container.error {
      background: rgba(239, 68, 68, 0.1);
      color: var(--accent-red);
    }
    @keyframes successPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
      50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(16, 185, 129, 0.5); }
    }
    h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
    p {
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1.6;
      margin: 0;
    }
    .btn {
      margin-top: 1rem;
    }
  `]
})
export class EmailVerificationComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    
    if (!token) {
      this.isLoading = false;
      this.isSuccess = false;
      this.errorMessage = 'Invalid verification link. No token provided.';
      return;
    }
  }
}