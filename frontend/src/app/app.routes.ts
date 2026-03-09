// ============================================
// app.routes.ts — Application Routes
// ============================================
// WHY THIS FILE?
// Defines which URL shows which component.
// Like a table of contents for our app.
//
// LAZY LOADING:
// loadComponent(() => import('...')) means the component
// is only downloaded when user navigates to that route.
// WHY? Faster initial load! App doesn't download ALL pages upfront.
//
// canActivate: [authGuard] means user must be logged in
// to access that route. If not, redirected to /auth/login
// ============================================

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Auth routes — public (no guard)
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then(m => m.AuthComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Dashboard — private (requires login)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // Kanban Board — private (requires login)
  {
    path: 'board/:id',
    loadComponent: () =>
      import('./features/board/board.component').then(m => m.BoardComponent),
    canActivate: [authGuard]
  },

  // Wildcard — redirect unknown URLs to dashboard
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];