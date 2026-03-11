import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="bg-dark-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
      <h2 class="text-2xl font-bold text-white mb-2">Welcome back</h2>
      <p class="text-slate-400 mb-6">Sign in to your account</p>

      <!-- Error Message -->
      <div *ngIf="error$ | async as error"
           class="bg-red-500/10 border border-red-500/30 text-red-400
                  rounded-lg p-3 mb-4 text-sm">
        {{ error }}
      </div>

      <!-- Login Form -->
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-300 mb-1">
            Email
          </label>
          <input
            type="email"
            formControlName="email"
            placeholder="you@example.com"
            class="w-full bg-dark-900 border border-slate-600 rounded-lg
                   px-4 py-3 text-white placeholder-slate-500
                   focus:outline-none focus:border-primary-500 transition-colors"
          />
          <p *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid"
             class="text-red-400 text-xs mt-1">
            Please enter a valid email
          </p>
        </div>

        <!-- Password -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            formControlName="password"
            placeholder="••••••••"
            class="w-full bg-dark-900 border border-slate-600 rounded-lg
                   px-4 py-3 text-white placeholder-slate-500
                   focus:outline-none focus:border-primary-500 transition-colors"
          />
          <p *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid"
             class="text-red-400 text-xs mt-1">
            Password must be at least 6 characters
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          [disabled]="loading$ | async"
          class="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50
                 disabled:cursor-not-allowed text-white font-semibold
                 rounded-lg px-4 py-3 transition-colors">
          <span *ngIf="!(loading$ | async)">Sign In</span>
          <span *ngIf="loading$ | async">Signing in...</span>
        </button>

        <!-- Try Demo Button -->
        <button
          type="button"
          (click)="fillDemo()"
          class="w-full mt-3 border border-primary-500 text-primary-400
                 hover:bg-primary-500/10 font-medium rounded-lg px-4 py-3
                 transition-colors text-sm">
          🚀 Try Demo Account
        </button>

      </form>

      <p class="text-center text-slate-400 mt-6 text-sm">
        Don't have an account?
        <a routerLink="/auth/register"
           class="text-primary-500 hover:text-primary-400 font-medium">
          Create one
        </a>
      </p>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading$: Observable<any>;
  error$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.loading$ = this.store.select(state => (state as any).auth.loading);
    this.error$ = this.store.select(state => (state as any).auth.error);

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.store.dispatch(AuthActions.loginRequest({ email, password }));
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // fills demo credentials automatically!
  fillDemo() {
    this.loginForm.patchValue({
      email: 'demo@taskflow.com',
      password: 'demo1234'
    });
  }
}