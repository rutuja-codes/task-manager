// ============================================
// app.config.ts — Application Configuration
// ============================================
// WHY THIS FILE?
// Angular 17+ uses standalone components.
// This file bootstraps the entire app with:
// - Router (navigation between pages)
// - HttpClient (API calls)
// - NgRx Store (state management)
// - NgRx Effects (side effects like API calls)
// ============================================

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authReducer } from './store/auth/auth.reducer';
import { projectReducer } from './store/project/project.reducer';
import { taskReducer } from './store/task/task.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { ProjectEffects } from './store/project/project.effects';
import { TaskEffects } from './store/task/task.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router — handles navigation between pages
    provideRouter(routes),

    // HttpClient — enables HTTP requests to our backend
    // withInterceptors — registers our auth interceptor
    // WHY INTERCEPTOR? Auto-adds JWT token to every request
    provideHttpClient(withInterceptors([authInterceptor])),

    // NgRx Store — registers all reducers
    // Each reducer manages one slice of state
    provideStore({
      auth: authReducer,       // manages login/logout state
      projects: projectReducer, // manages projects list
      tasks: taskReducer        // manages tasks
    }),

    // NgRx Effects — handles side effects (API calls)
    provideEffects([AuthEffects, ProjectEffects, TaskEffects]),

    // NgRx DevTools — lets you debug state in Chrome DevTools
    // Only active in development mode
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false
    })
  ]
};