import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <div class="logo">
            <i class="fas fa-shield-alt"></i>
            <span class="logo-text" *ngIf="!sidebarCollapsed">SOC<span class="highlight">Guard</span></span>
          </div>
          <button class="toggle-btn" (click)="toggleSidebar()">
            <i [class]="sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <a 
            routerLink="/dashboard" 
            routerLinkActive="active"
            class="nav-item"
            [attr.data-tooltip]="sidebarCollapsed ? 'Dashboard' : null"
          >
            <i class="fas fa-chart-line"></i>
            <span *ngIf="!sidebarCollapsed">Dashboard</span>
            <div class="active-indicator"></div>
          </a>
          
          <a 
            routerLink="/incidents" 
            routerLinkActive="active"
            class="nav-item"
            [attr.data-tooltip]="sidebarCollapsed ? 'Incidents' : null"
          >
            <i class="fas fa-exclamation-triangle"></i>
            <span *ngIf="!sidebarCollapsed">Incidents</span>
            <span class="badge badge-critical" *ngIf="!sidebarCollapsed && criticalCount > 0">{{ criticalCount }}</span>
            <div class="active-indicator"></div>
          </a>
          
          <a 
            routerLink="/alerts" 
            routerLinkActive="active"
            class="nav-item"
            [attr.data-tooltip]="sidebarCollapsed ? 'Alerts' : null"
          >
            <i class="fas fa-bell"></i>
            <span *ngIf="!sidebarCollapsed">Alerts</span>
            <span class="badge badge-high" *ngIf="!sidebarCollapsed && newAlerts > 0">{{ newAlerts }}</span>
            <div class="active-indicator"></div>
          </a>
          
          <a 
            routerLink="/threat-intel" 
            routerLinkActive="active"
            class="nav-item"
            [attr.data-tooltip]="sidebarCollapsed ? 'Threat Intel' : null"
          >
            <i class="fas fa-brain"></i>
            <span *ngIf="!sidebarCollapsed">Threat Intel</span>
            <div class="active-indicator"></div>
          </a>
          
          <a 
            *ngIf="isAnalyst()"
            routerLink="/analytics" 
            routerLinkActive="active"
            class="nav-item"
            [attr.data-tooltip]="sidebarCollapsed ? 'Analytics' : null"
          >
            <i class="fas fa-chart-pie"></i>
            <span *ngIf="!sidebarCollapsed">Analytics</span>
            <div class="active-indicator"></div>
          </a>
          
          <a 
            *ngIf="isAdmin()"
            routerLink="/users" 
            routerLinkActive="active"
            class="nav-item"
            [attr.data-tooltip]="sidebarCollapsed ? 'Users' : null"
          >
            <i class="fas fa-users"></i>
            <span *ngIf="!sidebarCollapsed">Users</span>
            <div class="active-indicator"></div>
          </a>
          
          <a 
            *ngIf="isAdmin()"
            routerLink="/settings" 
            routerLinkActive="active"
            class="nav-item"
            [attr.data-tooltip]="sidebarCollapsed ? 'Settings' : null"
          >
            <i class="fas fa-cog"></i>
            <span *ngIf="!sidebarCollapsed">Settings</span>
            <div class="active-indicator"></div>
          </a>
        </nav>
        
        <div class="sidebar-footer">
          <div class="user-info" *ngIf="!sidebarCollapsed" (click)="goToProfile()">
            <img 
              [src]="currentUser?.avatarUrl || defaultAvatar" 
              class="user-avatar-img"
              [alt]="currentUser?.username || 'User'"
            />
            <div class="user-details">
              <span class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
              <span class="user-role">{{ currentUser?.role }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()" [attr.data-tooltip]="sidebarCollapsed ? 'Logout' : null">
            <i class="fas fa-sign-out-alt"></i>
            <span *ngIf="!sidebarCollapsed">Logout</span>
          </button>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="main-content">
        <header class="top-header">
          <div class="header-left">
            <h1 class="page-title">{{ getPageTitle() }}</h1>
          </div>
          <div class="header-right">
            <div class="system-status">
              <span class="status-dot active"></span>
              <span>System Online</span>
            </div>
            <div class="current-time">{{ currentTime }}</div>
            
            <!-- NEW: User Profile Dropdown in Header -->
            <div class="header-user-menu" (click)="toggleUserMenu($event)">
              <img 
                [src]="currentUser?.avatarUrl || defaultAvatar" 
                class="header-avatar"
                [alt]="currentUser?.username || 'User'"
              />
              <span class="header-username" *ngIf="!sidebarCollapsed">{{ currentUser?.firstName }}</span>
              <i class="fas fa-chevron-down"></i>
              
              <!-- Dropdown Menu -->
              <div class="user-dropdown" *ngIf="showUserMenu" (click)="$event.stopPropagation()">
                <div class="dropdown-header">
                  <img 
                    [src]="currentUser?.avatarUrl || defaultAvatar" 
                    class="dropdown-avatar"
                    [alt]="currentUser?.username || 'User'"
                  />
                  <div class="dropdown-user-info">
                    <span class="dropdown-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
                    <span class="dropdown-role">{{ currentUser?.role }}</span>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <a routerLink="/profile" class="dropdown-item" (click)="showUserMenu = false">
                  <i class="fas fa-user"></i>
                  My Profile
                </a>
                <a routerLink="/settings" class="dropdown-item" (click)="showUserMenu = false" *ngIf="isAdmin()">
                  <i class="fas fa-cog"></i>
                  Settings
                </a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout" (click)="logout()">
                  <i class="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
      background: var(--primary-bg);
    }
    
    /* Sidebar */
    .sidebar {
      width: 260px;
      background: var(--secondary-bg);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: fixed;
      height: 100vh;
      z-index: 100;
    }
    
    .sidebar.collapsed {
      width: 70px;
    }
    
    .sidebar-header {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .logo i {
      width: 40px;
      height: 40px;
      background: var(--gradient-primary);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
    }
    
    .highlight {
      color: var(--accent-cyan);
    }
    
    .toggle-btn {
      width: 28px;
      height: 28px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .toggle-btn:hover {
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
    }
    
    .sidebar.collapsed .toggle-btn {
      display: none;
    }
    
    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      transition: all 0.2s;
      position: relative;
      text-decoration: none;
    }
    
    .nav-item i {
      width: 24px;
      text-align: center;
      font-size: 1.125rem;
    }
    
    .nav-item:hover {
      background: var(--card-bg);
      color: var(--text-primary);
    }
    
    .nav-item.active {
      background: rgba(0, 212, 255, 0.1);
      color: var(--accent-cyan);
    }
    
    .nav-item.active .active-indicator {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 24px;
      background: var(--accent-cyan);
      border-radius: 0 2px 2px 0;
    }
    
    .nav-item .badge {
      margin-left: auto;
      font-size: 0.6875rem;
      padding: 0.125rem 0.5rem;
    }
    
    /* Tooltip for collapsed sidebar */
    .sidebar.collapsed .nav-item[data-tooltip]:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.875rem;
      white-space: nowrap;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }
    
    /* Sidebar Footer */
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--border-color);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .user-info:hover {
      background: var(--card-bg);
      border-radius: var(--radius-md);
      padding: 0.5rem;
      margin: -0.5rem -0.5rem 0.5rem -0.5rem;
    }
    
    .user-avatar-img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--accent-cyan);
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .user-role {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    
    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .logout-btn:hover {
      border-color: var(--accent-red);
      color: var(--accent-red);
      background: rgba(239, 68, 68, 0.1);
    }
    
    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 260px;
      transition: margin-left 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    
    .sidebar.collapsed ~ .main-content {
      margin-left: 70px;
    }
    
    /* Top Header */
    .top-header {
      height: 70px;
      background: var(--secondary-bg);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    
    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    
    .system-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    
    .current-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9375rem;
      color: var(--accent-cyan);
      background: var(--card-bg);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }
    
    /* NEW: Header User Menu */
    .header-user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
    }
    
    .header-user-menu:hover {
      background: var(--card-bg);
    }
    
    .header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--accent-cyan);
    }
    
    .header-username {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    /* User Dropdown */
    .user-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      min-width: 260px;
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: fadeInDown 0.2s ease;
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }
    
    .dropdown-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--accent-cyan);
    }
    
    .dropdown-user-info {
      display: flex;
      flex-direction: column;
    }
    
    .dropdown-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.9375rem;
    }
    
    .dropdown-role {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    
    .dropdown-divider {
      height: 1px;
      background: var(--border-color);
      margin: 0.5rem 0;
    }
    
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      transition: all 0.2s;
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
    }
    
    .dropdown-item:hover {
      background: var(--secondary-bg);
      color: var(--text-primary);
    }
    
    .dropdown-item i {
      width: 20px;
      text-align: center;
    }
    
    .dropdown-item.logout {
      color: var(--accent-red);
    }
    
    .dropdown-item.logout:hover {
      background: rgba(239, 68, 68, 0.1);
    }
    
    /* Content Area */
    .content-area {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }
      
      .sidebar.open {
        transform: translateX(0);
      }
      
      .main-content {
        margin-left: 0;
      }
      
      .header-username {
        display: none;
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  sidebarCollapsed = false;
  currentUser: User | null = null;
  defaultAvatar = '';
  currentTime = '';
  criticalCount = 0;
  newAlerts = 0;
  showUserMenu = false;
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.defaultAvatar = `https://ui-avatars.com/api/?name=${user.username}&background=random`;
        this.loadUserProfile();
      }
    });
    
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header-user-menu')) {
      this.showUserMenu = false;
    }
  }
  
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }
  
  loadUserProfile(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        // Update stored user with latest data
        localStorage.setItem('user', JSON.stringify(user));
        // Update the auth service user
        this.authService['currentUserSubject'].next(user);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }
  
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
  
  getUserInitials(): string {
    if (!this.currentUser) return '';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }
  
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  isAnalyst(): boolean {
    return this.authService.isAnalyst();
  }
  
  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  getPageTitle(): string {
    const path = this.router.url.split('/')[1];
    const titles: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'incidents': 'Incidents',
      'alerts': 'Alerts',
      'threat-intel': 'Threat Intelligence',
      'analytics': 'Analytics',
      'users': 'User Management',
      'settings': 'Settings',
      'profile': 'My Profile'
    };
    return titles[path] || 'Dashboard';
  }
  
  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
}