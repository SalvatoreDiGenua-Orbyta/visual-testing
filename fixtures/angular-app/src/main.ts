import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config.js';

@Component({
  selector: 'vt-root',
  standalone: true,
  template: '<main></main>',
})
class RootComponent {}

bootstrapApplication(RootComponent, appConfig);
