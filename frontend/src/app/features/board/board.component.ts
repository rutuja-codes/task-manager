import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment.development';
import * as TaskActions from '../../store/task/task.actions';
import * as ProjectActions from '../../store/project/project.actions';
import { Task } from '../../core/services/task.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DragDropModule],
  template: `
    <div class="min-h-screen bg-dark-900 flex flex-col">

      <!-- Navbar -->
      <nav class="bg-dark-800 border-b border-slate-700 px-6 py-4 flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a routerLink="/dashboard"
               class="text-slate-400 hover:text-white transition-colors">
              ← Back
            </a>
            <div class="w-px h-5 bg-slate-700"></div>
            <h1 class="text-white font-semibold">
              {{ (project$ | async)?.name || 'Loading...' }}
            </h1>
          </div>
          <button
            (click)="showCreateTask = true"
            class="bg-primary-500 hover:bg-primary-600 text-white font-medium
                   rounded-lg px-4 py-2 flex items-center gap-2 transition-colors text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Task
          </button>
        </div>
      </nav>
      <!-- End Navbar -->

      <!-- Board -->
      <div class="flex-1 overflow-x-auto p-6">
        <div class="flex gap-6 h-full min-w-max">

          <!-- Column -->
          <div
            *ngFor="let column of columns$ | async"
            class="w-72 flex-shrink-0 flex flex-col">

            <!-- Column Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <h3 class="text-slate-300 font-medium text-sm">{{ column }}</h3>
                <span class="bg-dark-800 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                  {{ getTasksByStatus(column).length }}
                </span>
              </div>
            </div>
            <!-- End Column Header -->

            <!-- Drop Zone -->
            <div
              cdkDropList
              [id]="column"
              [cdkDropListData]="getTasksByStatus(column)"
              [cdkDropListConnectedTo]="columns$ | async"
              (cdkDropListDropped)="onDrop($event)"
              class="flex-1 bg-dark-800/50 rounded-xl p-3 min-h-32
                     border border-slate-700/50 flex flex-col gap-3">

              <!-- Task Card -->
              <div
                *ngFor="let task of getTasksByStatus(column)"
                cdkDrag
                class="bg-dark-800 border border-slate-700 rounded-lg p-4
                       cursor-grab active:cursor-grabbing hover:border-slate-600
                       transition-all">

                <!-- Priority + Delete -->
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [ngClass]="{
                      'bg-slate-700 text-slate-400': task.priority === 'low',
                      'bg-blue-500/20 text-blue-400': task.priority === 'medium',
                      'bg-orange-500/20 text-orange-400': task.priority === 'high',
                      'bg-red-500/20 text-red-400': task.priority === 'urgent'
                    }">
                    {{ task.priority }}
                  </span>
                  <button
                    (click)="onDeleteTask(task._id)"
                    class="text-slate-600 hover:text-red-400 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5
                           4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>

                <!-- Title -->
                <p class="text-white text-sm font-medium mb-3">{{ task.title }}</p>

                <!-- Description -->
                <p *ngIf="task.description"
                   class="text-slate-500 text-xs mb-3 line-clamp-2">
                  {{ task.description }}
                </p>

                <!-- Footer -->
                <div class="flex items-center justify-between">
                  <div *ngIf="task.assignee"
                       class="w-6 h-6 rounded-full bg-primary-500 flex
                              items-center justify-center text-white text-xs">
                    {{ task.assignee?.name?.charAt(0)?.toUpperCase() }}
                  </div>
                  <div *ngIf="!task.assignee" class="w-6 h-6"></div>
                  <span *ngIf="task.dueDate" class="text-xs text-slate-500">
                    {{ task.dueDate | date:'MMM d' }}
                  </span>
                </div>

              </div>
              <!-- End Task Card -->

              <!-- Empty Column -->
              <div *ngIf="getTasksByStatus(column).length === 0"
                   class="flex-1 flex items-center justify-center">
                <p class="text-slate-600 text-xs">Drop tasks here</p>
              </div>

            </div>
            <!-- End Drop Zone -->

          </div>
          <!-- End Column -->

        </div>
      </div>
      <!-- End Board -->

      <!-- Create Task Modal -->
      <div *ngIf="showCreateTask"
           class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div class="bg-dark-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">

          <h3 class="text-xl font-bold text-white mb-6">Create New Task</h3>

          <form [formGroup]="taskForm" (ngSubmit)="onCreateTask()">

            <!-- Title -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                formControlName="title"
                placeholder="What needs to be done?"
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
                placeholder="Add more details..."
                rows="3"
                class="w-full bg-dark-900 border border-slate-600 rounded-lg
                       px-4 py-3 text-white placeholder-slate-500
                       focus:outline-none focus:border-primary-500
                       transition-colors resize-none">
              </textarea>
            </div>

            <!-- Priority & Status -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  formControlName="priority"
                  class="w-full bg-dark-900 border border-slate-600 rounded-lg
                         px-4 py-3 text-white focus:outline-none
                         focus:border-primary-500 transition-colors">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">
                  Column
                </label>
                <select
                  formControlName="status"
                  class="w-full bg-dark-900 border border-slate-600 rounded-lg
                         px-4 py-3 text-white focus:outline-none
                         focus:border-primary-500 transition-colors">
                  <option *ngFor="let col of columns$ | async" [value]="col">
                    {{ col }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3">
              <button
                type="button"
                (click)="showCreateTask = false"
                class="flex-1 bg-dark-900 hover:bg-slate-700 text-slate-300
                       font-medium rounded-lg px-4 py-3 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="taskForm.invalid"
                class="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50
                       text-white font-medium rounded-lg px-4 py-3 transition-colors">
                Create Task
              </button>
            </div>

          </form>
          <!-- End Form -->

        </div>
      </div>
      <!-- End Modal -->

    </div>
    <!-- End Root -->
  `
})
export class BoardComponent implements OnInit, OnDestroy {

  showCreateTask = false;
  taskForm!: FormGroup;
  project$!: Observable<any>;
  tasks$!: Observable<any>;
  columns$!: Observable<any>;

  private socket: Socket | null = null;
  private projectId: string = '';
  private allTasks: Task[] = [];

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    // ✅ All store selects inside constructor
    this.project$ = this.store.select(state => (state as any).projects.selectedProject);
    this.tasks$ = this.store.select(state => (state as any).tasks.tasks);
    this.columns$ = this.store.select(
      state => (state as any).projects.selectedProject?.columns || []
    );

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      priority: ['medium'],
      status: ['Todo']
    });
  }

  ngOnInit() {
    this.projectId = this.route.snapshot.params['id'];
    this.store.dispatch(ProjectActions.loadProject({ id: this.projectId }));
    this.store.dispatch(TaskActions.loadTasks({ projectId: this.projectId }));

    this.tasks$.subscribe((tasks: Task[]) => {
      this.allTasks = tasks;
    });

    this.connectSocket();
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.emit('leave_project', this.projectId);
      this.socket.disconnect();
    }
    this.store.dispatch(TaskActions.clearTasks());
  }

  connectSocket() {
    this.socket = io(environment.socketUrl);
    this.socket.emit('join_project', this.projectId);

    this.socket.on('task_created', (task: Task) => {
      this.store.dispatch(TaskActions.taskCreatedRealtime({ task }));
    });

    this.socket.on('task_updated', (task: Task) => {
      this.store.dispatch(TaskActions.taskUpdatedRealtime({ task }));
    });

    this.socket.on('task_moved', (data: any) => {
      this.store.dispatch(TaskActions.taskMovedRealtime({ task: data.task }));
    });

    this.socket.on('task_deleted', (data: any) => {
      this.store.dispatch(TaskActions.taskDeletedRealtime({ taskId: data.taskId }));
    });
  }

  getTasksByStatus(status: string): Task[] {
    return this.allTasks.filter(t => t.status === status);
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.store.dispatch(TaskActions.moveTask({
        id: task._id,
        data: { status: newStatus, position: event.currentIndex }
      }));
    }
  }

  onCreateTask() {
    if (this.taskForm.valid) {
      this.store.dispatch(TaskActions.createTask({
        data: { ...this.taskForm.value, projectId: this.projectId }
      }));
      this.showCreateTask = false;
      this.taskForm.reset({ priority: 'medium', status: 'Todo' });
    }
  }

  onDeleteTask(id: string) {
    if (confirm('Delete this task?')) {
      this.store.dispatch(TaskActions.deleteTask({ id }));
    }
  }
}