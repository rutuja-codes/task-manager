import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as ProjectActions from '../../store/project/project.actions';
import * as AuthActions from '../../store/auth/auth.actions';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-dark-900">

      <!-- Navbar -->
      <nav class="bg-dark-800 border-b border-slate-700 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">

          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <span class="text-white font-bold text-lg">TaskFlow</span>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-4">
            <span class="text-slate-400 text-sm">
              {{ (user$ | async)?.name }}
            </span>
            <button (click)="onLogout()"
              class="text-slate-400 hover:text-white text-sm transition-colors">
              Logout
            </button>
          </div>

        </div>
      </nav>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-6 py-8">

        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold text-white">My Projects</h1>
            <p class="text-slate-400 mt-1">
              {{ (projects$ | async)?.length || 0 }} projects
            </p>
          </div>
          <button (click)="showCreateModal = true"
            class="bg-primary-500 hover:bg-primary-600 text-white font-medium
                   rounded-lg px-4 py-2 flex items-center gap-2 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Project
          </button>
        </div>

        <!-- Loading Spinner -->
        <div *ngIf="loading$ | async"
             class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent
                      rounded-full animate-spin">
          </div>
        </div>

        <!-- Projects Grid -->
        <div *ngIf="!(loading$ | async)"
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <a *ngFor="let proj of projects$ | async"
             [routerLink]="['/board', proj._id]"
             class="bg-dark-800 border border-slate-700 rounded-xl p-6
                    hover:border-primary-500/50 hover:shadow-lg
                    hover:shadow-primary-500/10 transition-all cursor-pointer block">

            <!-- Color Bar -->
            <div class="w-full h-1 rounded-full mb-4"
                 [style.background]="proj.color">
            </div>

            <!-- Project Name -->
            <h3 class="text-white font-semibold text-lg mb-2">
              {{ proj.name }}
            </h3>

            <!-- Description -->
            <p class="text-slate-400 text-sm mb-4 line-clamp-2">
              {{ proj.description || 'No description' }}
            </p>

            <!-- Card Footer -->
            <div class="flex items-center justify-between">

              <!-- Member Avatars -->
              <div class="flex -space-x-2">
                <div *ngFor="let member of proj.members.slice(0, 3)"
                     class="w-7 h-7 rounded-full bg-primary-500 border-2
                            border-dark-800 flex items-center justify-center
                            text-white text-xs font-medium">
                  {{ member.user?.name?.charAt(0)?.toUpperCase() }}
                </div>
              </div>

              <!-- Columns Count -->
              <span class="text-slate-500 text-xs">
                {{ proj.columns.length }} columns
              </span>

            </div>

          </a>

          <!-- Empty State -->
          <div *ngIf="(projects$ | async)?.length === 0"
               class="col-span-3 text-center py-20">
            <div class="w-16 h-16 bg-dark-800 rounded-2xl flex items-center
                        justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-slate-600" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/>
              </svg>
            </div>
            <h3 class="text-slate-400 font-medium mb-2">No projects yet</h3>
            <p class="text-slate-600 text-sm">
              Create your first project to get started!
            </p>
          </div>

        </div>
        <!-- End Projects Grid -->

      </div>
      <!-- End Main Content -->

      <!-- Create Project Modal -->
      <div *ngIf="showCreateModal"
           class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">

          <h3 class="text-xl font-bold text-white mb-6">Create New Project</h3>

          <form [formGroup]="projectForm" (ngSubmit)="onCreateProject()">

            <!-- Project Name -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-300 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                formControlName="name"
                placeholder="My Awesome Project"
                class="w-full bg-dark-900 border border-slate-600 rounded-lg
                       px-4 py-3 text-white placeholder-slate-500
                       focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <!-- Description -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-300 mb-1">
                Description
              </label>
              <textarea
                formControlName="description"
                placeholder="What is this project about?"
                rows="3"
                class="w-full bg-dark-900 border border-slate-600 rounded-lg
                       px-4 py-3 text-white placeholder-slate-500
                       focus:outline-none focus:border-primary-500
                       transition-colors resize-none">
              </textarea>
            </div>

            <!-- Color Picker -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-300 mb-2">
                Project Color
              </label>
              <div class="flex gap-3">
                <button
                  type="button"
                  *ngFor="let color of colors"
                  (click)="projectForm.patchValue({ color: color })"
                  class="w-8 h-8 rounded-full border-2 transition-all"
                  [style.background]="color"
                  [class.border-white]="projectForm.get('color')?.value === color"
                  [class.border-transparent]="projectForm.get('color')?.value !== color">
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                type="button"
                (click)="showCreateModal = false"
                class="flex-1 bg-dark-900 hover:bg-slate-700 text-slate-300
                       font-medium rounded-lg px-4 py-3 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="projectForm.invalid"
                class="flex-1 bg-primary-500 hover:bg-primary-600
                       disabled:opacity-50 text-white font-medium
                       rounded-lg px-4 py-3 transition-colors">
                Create Project
              </button>
            </div>

          </form>

        </div>
      </div>
      <!-- End Modal -->

    </div>
    <!-- End Root -->
  `
})
export class DashboardComponent implements OnInit {

  showCreateModal = false;
  projectForm!: FormGroup;
  projects$!: Observable<any>;
  loading$!: Observable<any>;
  user$!: Observable<any>;

  colors = [
    '#6366f1', '#8b5cf6', '#ec4899',
    '#ef4444', '#f97316', '#22c55e',
    '#06b6d4', '#3b82f6'
  ];

  constructor(
    private store: Store,
    private fb: FormBuilder
  ) {
    this.projects$ = this.store.select(state => (state as any).projects.projects);
    this.loading$ = this.store.select(state => (state as any).projects.loading);
    this.user$ = this.store.select(state => (state as any).auth.user);

    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      color: ['#6366f1']
    });
  }

  ngOnInit() {
    this.store.dispatch(ProjectActions.loadProjects());
    this.store.dispatch(AuthActions.loadCurrentUser());
  }

  onCreateProject() {
    if (this.projectForm.valid) {
      this.store.dispatch(ProjectActions.createProject({
        data: this.projectForm.value
      }));
      this.showCreateModal = false;
      this.projectForm.reset({ color: '#6366f1' });
    }
  }

  onLogout() {
    this.store.dispatch(AuthActions.logout());
  }
}