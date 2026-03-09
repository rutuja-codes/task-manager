import { createReducer, on } from '@ngrx/store';
import { Project } from '../../core/services/project.service';
import * as ProjectActions from './project.actions';

export interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
}

export const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null
};

export const projectReducer = createReducer(
  initialState,

  on(ProjectActions.loadProjects, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ProjectActions.loadProjectsSuccess, (state, { projects }) => ({
    ...state,
    projects,
    loading: false,
    error: null
  })),

  on(ProjectActions.loadProjectsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(ProjectActions.loadProjectSuccess, (state, { project }) => ({
    ...state,
    selectedProject: project,
    loading: false
  })),

  on(ProjectActions.createProjectSuccess, (state, { project }) => ({
    ...state,
    projects: [project, ...state.projects],
    loading: false
  })),

  on(ProjectActions.updateProjectSuccess, (state, { project }) => ({
    ...state,
    projects: state.projects.map(p =>
      p._id === project._id ? project : p
    ),
    selectedProject: project,
    loading: false
  })),

  on(ProjectActions.deleteProjectSuccess, (state, { id }) => ({
    ...state,
    projects: state.projects.filter(p => p._id !== id),
    loading: false
  })),

  on(ProjectActions.setSelectedProject, (state, { project }) => ({
    ...state,
    selectedProject: project
  }))
);