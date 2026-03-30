import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { EmailVerificationComponent } from './components/email-verification/email-verification.component';

export const routes: Routes = [
  // Public routes (NO layout wrapper)
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  
  // Protected routes (WITH layout wrapper) - All routes inside children array
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'incidents',
        loadComponent: () => import('./components/incidents/incidents.component').then(m => m.IncidentsComponent)
      },
      {
        path: 'incidents/:id',
        loadComponent: () => import('./components/incident-detail/incident-detail.component').then(m => m.IncidentDetailComponent)
      },
      {
        path: 'alerts',
        loadComponent: () => import('./components/alerts/alerts.component').then(m => m.AlertsComponent)
      },
      {
        path: 'threat-intel',
        loadComponent: () => import('./components/threat-intel/threat-intel.component').then(m => m.ThreatIntelComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./components/analytics/analytics.component').then(m => m.AnalyticsComponent),
        canActivate: [() => roleGuard(['ADMIN', 'ANALYST'])]
      },
      {
        path: 'users',
        loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent),
        canActivate: [() => roleGuard(['ADMIN'])]
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [() => roleGuard(['ADMIN'])]
      },
      // Default redirect inside layout
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  
  // Catch all redirect
  {
    path: '**',
    redirectTo: 'dashboard'
  },
  
  { path: 'forgot-password', component: ForgotPasswordComponent }
];