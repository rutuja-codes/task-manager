// ============================================
// task.service.ts — Task API Calls
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: any;
  assignee: any;
  dueDate: string | null;
  position: number;
  labels: string[];
  isArchived: boolean;
  createdAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId: string;
  status?: string;
  priority?: string;
  assignee?: string;
  dueDate?: string;
  labels?: string[];
}

export interface MoveTaskDto {
  status: string;
  position: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // Get all tasks for a project
  getTasks(projectId: string): Observable<{ success: boolean; tasks: Task[] }> {
    return this.http.get<{ success: boolean; tasks: Task[] }>(
      `${this.apiUrl}?projectId=${projectId}`
    );
  }

  // Get single task
  getTask(id: string): Observable<{ success: boolean; task: Task }> {
    return this.http.get<{ success: boolean; task: Task }>(`${this.apiUrl}/${id}`);
  }

  // Create task
  createTask(data: CreateTaskDto): Observable<{ success: boolean; task: Task }> {
    return this.http.post<{ success: boolean; task: Task }>(this.apiUrl, data);
  }

  // Update task
  updateTask(id: string, data: Partial<CreateTaskDto>): Observable<{ success: boolean; task: Task }> {
    return this.http.put<{ success: boolean; task: Task }>(`${this.apiUrl}/${id}`, data);
  }

  // Move task (drag & drop)
  moveTask(id: string, data: MoveTaskDto): Observable<{ success: boolean; task: Task }> {
    return this.http.patch<{ success: boolean; task: Task }>(
      `${this.apiUrl}/${id}/move`, data
    );
  }

  // Delete task
  deleteTask(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}