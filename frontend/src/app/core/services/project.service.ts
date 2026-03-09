// ============================================
// project.service.ts — Project API Calls
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: any;
  members: any[];
  columns: string[];
  color: string;
  isArchived: boolean;
  createdAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
  columns?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  // Get all projects for logged in user
  getProjects(): Observable<{ success: boolean; projects: Project[] }> {
    return this.http.get<{ success: boolean; projects: Project[] }>(this.apiUrl);
  }

  // Get single project by ID
  getProject(id: string): Observable<{ success: boolean; project: Project }> {
    return this.http.get<{ success: boolean; project: Project }>(`${this.apiUrl}/${id}`);
  }

  // Create new project
  createProject(data: CreateProjectDto): Observable<{ success: boolean; project: Project }> {
    return this.http.post<{ success: boolean; project: Project }>(this.apiUrl, data);
  }

  // Update project
  updateProject(id: string, data: Partial<CreateProjectDto>): Observable<{ success: boolean; project: Project }> {
    return this.http.put<{ success: boolean; project: Project }>(`${this.apiUrl}/${id}`, data);
  }

  // Delete project
  deleteProject(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  // Add member to project
  addMember(projectId: string, email: string, role: string = 'member'): Observable<any> {
    return this.http.post(`${this.apiUrl}/${projectId}/members`, { email, role });
  }

  // Remove member from project
  removeMember(projectId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${projectId}/members/${userId}`);
  }
}