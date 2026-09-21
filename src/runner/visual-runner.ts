import type { ApplicationRef } from '@angular/core';
import type { Locator } from '@playwright/test';
import type { VisualDefinition } from '../definitions/types.js';
import { createVisualHarness } from '../angular/harness.js';
import { waitForAngularStable, waitForFonts } from '../angular/stabilize.js';
import { applyInputs } from './input-application.js';
import { snapshotPath } from '../snapshots/path.js';
import type { VisualScreenshotAdapter } from '../playwright/adapter.js';
import type { VisualResult } from './status.js';

export interface VisualRunnerOptions {
  readonly applicationRef: ApplicationRef;
  readonly locatorForHost: (host: HTMLElement) => Locator;
  readonly adapter: VisualScreenshotAdapter;
  readonly snapshotRoot: string;
  readonly update: boolean;
}

export async function runDefinition(definition: VisualDefinition<unknown>, options: VisualRunnerOptions): Promise<VisualResult[]> {
  const results: VisualResult[] = [];
  for (const variant of definition.variants) {
    const identity = { component: definition.component.name || 'anonymous', definition: definition.name, variant: variant.name };
    const harness = createVisualHarness(options.applicationRef, definition.component, definition.providers ?? []);
    try {
      applyInputs(harness.componentRef, variant.inputs);
      harness.componentRef.changeDetectorRef.detectChanges();
      await waitForAngularStable(options.applicationRef);
      await waitForFonts();
      const relative = snapshotPath(options.snapshotRoot, definition, variant).split(/[\\/]/).slice(-3).join('/');
      await options.adapter.compare(options.locatorForHost(harness.host), relative, options.update);
      results.push({ status: 'PASS', ...identity });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const missing = /snapshot.*(does not exist|doesn't exist)|snapshot.*not found/i.test(message);
      results.push({ status: missing ? 'WARNING' : 'VISUAL DIFFERENCE', ...identity, message });
    } finally {
      harness.destroy();
    }
  }
  return results;
}
