import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { appConfig } from './app.config.js';
import { FixtureButtonComponent } from './app.component.js';

@Component({
  selector: 'vt-root',
  standalone: true,
  imports: [FixtureButtonComponent],
  template: '<main><vt-button /></main>',
})
class RootComponent {}

bootstrapApplication(RootComponent, appConfig);
