import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FixtureButtonComponent } from './app.component.js';
import { appConfig } from './app.config.js';
import { createVisualHarness } from '../../../src/angular/harness.js';
import { applyInputs } from '../../../src/runner/input-application.js';
import { waitForAngularStable, waitForFonts } from '../../../src/angular/stabilize.js';

@Component({
  selector: 'vt-root',
  standalone: true,
  template: '<main></main>',
})
class RootComponent {}

bootstrapApplication(RootComponent, appConfig).then(async (applicationRef) => {
  const harness = createVisualHarness(applicationRef, FixtureButtonComponent);
  applyInputs(harness.componentRef, {
    label: 'Integration',
    variant: 'secondary',
  });
  harness.componentRef.changeDetectorRef.detectChanges();
  await waitForAngularStable(applicationRef);
  await waitForFonts();

  (window as unknown as { __visualHarnessReady?: boolean }).__visualHarnessReady = true;
});
