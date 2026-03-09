import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="bg-dark-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
      <h2 class="text-2xl font-bold text-white mb-2">Create account</h2>
      <p class="text-slate-400 mb-6">Start managing your projects today</p>

      <!-- Error -->
      <div *ngIf="error$ | async as error"
           class="bg-red-500/10 border border-red-500/30 text-red-400
                  rounded-lg p-3 mb-4 text-sm">
        {{ error }}
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">

        <!-- Name -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            formControlName="name"
            placeholder="Rutuja Pawar"
            class="w-full bg-dark-900 border border-slate-600 rounded-lg
                   px-4 py-3 text-white placeholder-slate-500
                   focus:outline-none focus:border-primary-500 transition-colors"
          />
          <p *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.invalid"
             class="text-red-400 text-xs mt-1">
            Name must be at least 2 characters
          </p>
        </div>

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
          <p *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid"
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
          <p *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid"
             class="text-red-400 text-xs mt-1">
            Password must be at least 6 characters
          </p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          [disabled]="loading$ | async"
          class="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50
                 disabled:cursor-not-allowed text-white font-semibold
                 rounded-lg px-4 py-3 transition-colors">
          <span *ngIf="!(loading$ | async)">Create Account</span>
          <span *ngIf="loading$ | async">Creating...</span>
        </button>

      </form>

      <p class="text-center text-slate-400 mt-6 text-sm">
        Already have an account?
        <a routerLink="/auth/login"
           class="text-primary-500 hover:text-primary-400 font-medium">
          Sign in
        </a>
      </p>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading$: Observable<any>;
  error$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    // ✅ Inside constructor — store is initialized!
    this.loading$ = this.store.select(state => (state as any).auth.loading);
    this.error$ = this.store.select(state => (state as any).auth.error);

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      this.store.dispatch(AuthActions.registerRequest({ name, email, password }));
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}