import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {

  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginRequest),
      switchMap(({ email, password }) =>
        this.authService.login({ email, password }).pipe(
          map(response => {
            this.authService.saveToken(response.token);
            return AuthActions.loginSuccess({
              user: response.user,
              token: response.token
            });
          }),
          catchError(error =>
            of(AuthActions.loginFailure({
              error: error.error?.message || 'Login failed'
            }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => this.router.navigate(['/dashboard']))
    ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerRequest),
      switchMap(({ name, email, password }) =>
        this.authService.register({ name, email, password }).pipe(
          map(response => {
            this.authService.saveToken(response.token);
            return AuthActions.registerSuccess({
              user: response.user,
              token: response.token
            });
          }),
          catchError(error =>
            of(AuthActions.registerFailure({
              error: error.error?.message || 'Registration failed'
            }))
          )
        )
      )
    )
  );

  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(() => this.router.navigate(['/dashboard']))
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.removeToken();
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );

  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadCurrentUser),
      switchMap(() =>
        this.authService.getMe().pipe(
          map(response =>
            AuthActions.loadCurrentUserSuccess({ user: response.user })
          ),
          catchError(() =>
            of(AuthActions.loadCurrentUserFailure())
          )
        )
      )
    )
  );
}