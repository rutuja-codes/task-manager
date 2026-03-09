import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token')
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.loginRequest, (state) => ({
    ...state, loading: true, error: null
  })),

  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state, user, token, loading: false, error: null, isAuthenticated: true
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  on(AuthActions.registerRequest, (state) => ({
    ...state, loading: true, error: null
  })),

  on(AuthActions.registerSuccess, (state, { user, token }) => ({
    ...state, user, token, loading: false, error: null, isAuthenticated: true
  })),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  on(AuthActions.logout, () => ({
    user: null, token: null, loading: false, error: null, isAuthenticated: false
  })),

  on(AuthActions.loadCurrentUserSuccess, (state, { user }) => ({
    ...state, user, isAuthenticated: true
  })),

  on(AuthActions.loadCurrentUserFailure, () => ({
    user: null, token: null, loading: false, error: null, isAuthenticated: false
  }))
);