import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ProjectService } from '../../core/services/project.service';
import * as ProjectActions from './project.actions';

@Injectable()
export class ProjectEffects {

  private actions$ = inject(Actions);
  private projectService = inject(ProjectService);

  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadProjects),
      switchMap(() =>
        this.projectService.getProjects().pipe(
          map(response =>
            ProjectActions.loadProjectsSuccess({ projects: response.projects })
          ),
          catchError(error =>
            of(ProjectActions.loadProjectsFailure({
              error: error.error?.message || 'Failed to load projects'
            }))
          )
        )
      )
    )
  );

  loadProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadProject),
      switchMap(({ id }) =>
        this.projectService.getProject(id).pipe(
          map(response =>
            ProjectActions.loadProjectSuccess({ project: response.project })
          ),
          catchError(error =>
            of(ProjectActions.loadProjectFailure({
              error: error.error?.message || 'Failed to load project'
            }))
          )
        )
      )
    )
  );

  createProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.createProject),
      switchMap(({ data }) =>
        this.projectService.createProject(data).pipe(
          map(response =>
            ProjectActions.createProjectSuccess({ project: response.project })
          ),
          catchError(error =>
            of(ProjectActions.createProjectFailure({
              error: error.error?.message || 'Failed to create project'
            }))
          )
        )
      )
    )
  );

  updateProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.updateProject),
      switchMap(({ id, data }) =>
        this.projectService.updateProject(id, data).pipe(
          map(response =>
            ProjectActions.updateProjectSuccess({ project: response.project })
          ),
          catchError(error =>
            of(ProjectActions.updateProjectFailure({
              error: error.error?.message || 'Failed to update project'
            }))
          )
        )
      )
    )
  );

  deleteProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.deleteProject),
      switchMap(({ id }) =>
        this.projectService.deleteProject(id).pipe(
          map(() => ProjectActions.deleteProjectSuccess({ id })),
          catchError(error =>
            of(ProjectActions.deleteProjectFailure({
              error: error.error?.message || 'Failed to delete project'
            }))
          )
        )
      )
    )
  );
}