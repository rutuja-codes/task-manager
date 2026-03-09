// ============================================
// app.component.ts — Root Component
// ============================================
// WHY THIS FILE?
// This is the ROOT component of the entire app.
// It's the first component that loads.
// It just renders <router-outlet> which shows
// the correct page based on current URL.
// ============================================

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}