import { createAction, props } from '@ngrx/store';
import { Task, CreateTaskDto, MoveTaskDto } from '../../core/services/task.service';

export const loadTasks = createAction(
  '[Task] Load Tasks',
  props<{ projectId: string }>()
);

export const loadTasksSuccess = createAction(
  '[Task] Load Tasks Success',
  props<{ tasks: Task[] }>()
);

export const loadTasksFailure = createAction(
  '[Task] Load Tasks Failure',
  props<{ error: string }>()
);

export const createTask = createAction(
  '[Task] Create Task',
  props<{ data: CreateTaskDto }>()
);

export const createTaskSuccess = createAction(
  '[Task] Create Task Success',
  props<{ task: Task }>()
);

export const createTaskFailure = createAction(
  '[Task] Create Task Failure',
  props<{ error: string }>()
);

export const updateTask = createAction(
  '[Task] Update Task',
  props<{ id: string; data: Partial<CreateTaskDto> }>()
);

export const updateTaskSuccess = createAction(
  '[Task] Update Task Success',
  props<{ task: Task }>()
);

export const updateTaskFailure = createAction(
  '[Task] Update Task Failure',
  props<{ error: string }>()
);

export const moveTask = createAction(
  '[Task] Move Task',
  props<{ id: string; data: MoveTaskDto }>()
);

export const moveTaskSuccess = createAction(
  '[Task] Move Task Success',
  props<{ task: Task }>()
);

export const moveTaskFailure = createAction(
  '[Task] Move Task Failure',
  props<{ error: string }>()
);

export const deleteTask = createAction(
  '[Task] Delete Task',
  props<{ id: string }>()
);

export const deleteTaskSuccess = createAction(
  '[Task] Delete Task Success',
  props<{ id: string }>()
);

export const deleteTaskFailure = createAction(
  '[Task] Delete Task Failure',
  props<{ error: string }>()
);

// Real-time socket updates
export const taskCreatedRealtime = createAction(
  '[Task] Task Created Realtime',
  props<{ task: Task }>()
);

export const taskUpdatedRealtime = createAction(
  '[Task] Task Updated Realtime',
  props<{ task: Task }>()
);

export const taskMovedRealtime = createAction(
  '[Task] Task Moved Realtime',
  props<{ task: Task }>()
);

export const taskDeletedRealtime = createAction(
  '[Task] Task Deleted Realtime',
  props<{ taskId: string }>()
);

export const clearTasks = createAction('[Task] Clear Tasks');