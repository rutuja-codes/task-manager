// ============================================
// auth.interceptor.ts — Auto JWT Injector
// ============================================
// WHY THIS FILE?
// Every protected API request needs a JWT token
// in the Authorization header.
// Instead of manually adding token in EVERY service,
// this interceptor AUTOMATICALLY adds it to every request!
//
// HOW IT WORKS?
// 1. User makes any HTTP request
// 2. Interceptor runs BEFORE request is sent
// 3. Gets token from localStorage
// 4. Clones request and adds Authorization header
// 5. Sends modified request to backend
//
// Think of it like a post office that automatically
// stamps every letter before sending it!
// ============================================

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from localStorage
  // WHY LOCALSTORAGE? It persists even after browser refresh
  const token = localStorage.getItem('token');

  // If token exists, clone request and add Authorization header
  // WHY CLONE? HTTP requests are immutable — we can't modify them
  // We must create a copy with the new header
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    // Pass modified request to next handler
    return next(authReq);
  }

  // If no token, send original request as-is
  // (for public routes like login/register)
  return next(req);
};