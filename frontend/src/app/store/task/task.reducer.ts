import { createReducer, on } from '@ngrx/store';
import { Task } from '../../core/services/task.service';
import * as TaskActions from './task.actions';

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null
};

export const taskReducer = createReducer(
  initialState,

  on(TaskActions.loadTasks, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TaskActions.loadTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks,
    loading: false,
    error: null
  })),

  on(TaskActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(TaskActions.createTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [...state.tasks, task],
    loading: false
  })),

  on(TaskActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map(t => t._id === task._id ? task : t),
    loading: false
  })),

  on(TaskActions.moveTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map(t => t._id === task._id ? task : t),
    loading: false
  })),

  on(TaskActions.deleteTaskSuccess, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter(t => t._id !== id),
    loading: false
  })),

  // Real-time socket updates
  on(TaskActions.taskCreatedRealtime, (state, { task }) => ({
    ...state,
    tasks: [...state.tasks, task]
  })),

  on(TaskActions.taskUpdatedRealtime, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map(t => t._id === task._id ? task : t)
  })),

  on(TaskActions.taskMovedRealtime, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map(t => t._id === task._id ? task : t)
  })),

  on(TaskActions.taskDeletedRealtime, (state, { taskId }) => ({
    ...state,
    tasks: state.tasks.filter(t => t._id !== taskId)
  })),

  on(TaskActions.clearTasks, (state) => ({
    ...state,
    tasks: []
  }))
);