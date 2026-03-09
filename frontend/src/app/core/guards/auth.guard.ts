// ============================================
// auth.guard.ts — Route Protection
// ============================================
// WHY THIS FILE?
// Prevents unauthenticated users from accessing
// private pages like Dashboard and Board.
//
// HOW IT WORKS?
// 1. User tries to navigate to /dashboard
// 2. Auth guard runs first
// 3. Checks if token exists in localStorage
// 4. If YES → allow navigation
// 5. If NO → redirect to /auth/login
//
// Think of it like a bouncer at a club —
// checks your ID before letting you in!
// ============================================

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // inject() is Angular's way of getting services in functions
  const router = inject(Router);

  // Check if token exists in localStorage
  const token = localStorage.getItem('token');

  if (token) {
    // Token exists — allow navigation
    return true;
  }

  // No token — redirect to login page
  // { queryParams: { returnUrl: state.url } } saves where user
  // was trying to go, so after login we can redirect them there
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};