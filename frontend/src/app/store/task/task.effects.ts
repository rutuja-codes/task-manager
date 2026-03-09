import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { TaskService } from '../../core/services/task.service';
import * as TaskActions from './task.actions';

@Injectable()
export class TaskEffects {

  private actions$ = inject(Actions);
  private taskService = inject(TaskService);

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      switchMap(({ projectId }) =>
        this.taskService.getTasks(projectId).pipe(
          map(response =>
            TaskActions.loadTasksSuccess({ tasks: response.tasks })
          ),
          catchError(error =>
            of(TaskActions.loadTasksFailure({
              error: error.error?.message || 'Failed to load tasks'
            }))
          )
        )
      )
    )
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.createTask),
      switchMap(({ data }) =>
        this.taskService.createTask(data).pipe(
          map(response =>
            TaskActions.createTaskSuccess({ task: response.task })
          ),
          catchError(error =>
            of(TaskActions.createTaskFailure({
              error: error.error?.message || 'Failed to create task'
            }))
          )
        )
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTask),
      switchMap(({ id, data }) =>
        this.taskService.updateTask(id, data).pipe(
          map(response =>
            TaskActions.updateTaskSuccess({ task: response.task })
          ),
          catchError(error =>
            of(TaskActions.updateTaskFailure({
              error: error.error?.message || 'Failed to update task'
            }))
          )
        )
      )
    )
  );

  moveTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.moveTask),
      switchMap(({ id, data }) =>
        this.taskService.moveTask(id, data).pipe(
          map(response =>
            TaskActions.moveTaskSuccess({ task: response.task })
          ),
          catchError(error =>
            of(TaskActions.moveTaskFailure({
              error: error.error?.message || 'Failed to move task'
            }))
          )
        )
      )
    )
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.deleteTask),
      switchMap(({ id }) =>
        this.taskService.deleteTask(id).pipe(
          map(() => TaskActions.deleteTaskSuccess({ id })),
          catchError(error =>
            of(TaskActions.deleteTaskFailure({
              error: error.error?.message || 'Failed to delete task'
            }))
          )
        )
      )
    )
  );
}