import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';

declare global {
  interface Window {
    __angularBootstrapCompleted?: boolean;
  }
}

@Component({
  selector: 'vt-root',
  standalone: true,
  template: '<main></main>',
})
class RootComponent {}

bootstrapApplication(RootComponent, appConfig).then(() => {
  window.__angularBootstrapCompleted = true;
});
