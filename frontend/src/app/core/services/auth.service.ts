// ============================================
// auth.service.ts — Auth API Calls
// ============================================
// WHY THIS FILE?
// Services in Angular are responsible for
// talking to the backend API.
// This service handles all auth-related API calls:
// login, register, logout, getMe
//
// WHY INJECTABLE?
// @Injectable makes this service available
// throughout the app via dependency injection.
// Any component can use it by injecting it!
//
// WHERE IS IT USED?
// → NgRx Auth Effects use this to make API calls
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

// Interfaces — define shape of data
// WHY INTERFACES? TypeScript safety — catch errors at compile time!
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root' // available throughout entire app
})
export class AuthService {

  // API base URL from environment file
  private apiUrl = `${environment.apiUrl}/auth`;

  // HttpClient injected via constructor
  // Angular automatically provides it because we registered
  // provideHttpClient() in app.config.ts
  constructor(private http: HttpClient) {}

  // ─── Register ──────────────────────────────
  // Returns Observable — Angular's way of handling async operations
  // Component subscribes to this Observable to get the response
  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials);
  }

  // ─── Login ─────────────────────────────────
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  // ─── Get Current User ──────────────────────
  getMe(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/me`);
  }

  // ─── Logout ────────────────────────────────
  logout(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/logout`, {}
    );
  }

  // ─── Token Management ──────────────────────
  // WHY THESE METHODS?
  // localStorage stores token between page refreshes
  // These helper methods keep token management in one place

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}