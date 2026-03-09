// ============================================
// auth.component.ts — Auth Shell Component
// ============================================
// WHY THIS FILE?
// This is the PARENT component for login & register.
// It provides the layout/wrapper for both pages.
// Router renders LoginComponent or RegisterComponent
// inside <router-outlet> based on URL.
// ============================================

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16
                      bg-primary-500 rounded-2xl mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7
                       a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5
                       a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white">TaskFlow</h1>
          <p class="text-slate-400 mt-1">Manage your projects efficiently</p>
        </div>
        <!-- Login or Register renders here -->
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AuthComponent {}