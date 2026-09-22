import {
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  type ApplicationRef,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import type { VisualTestingConfig } from '../definitions/types.js';
import { installBrowserRuntime } from '../cli/browser-runtime.js';

export const VISUAL_TESTING_CONFIG = new InjectionToken<VisualTestingConfig>(
  'VISUAL_TESTING_CONFIG',
);

export function provideVisualTesting(config: VisualTestingConfig): EnvironmentProviders {
  if (!config.definitions.trim()) {
    throw new Error('Visual testing definitions entrypoint is required.');
  }

  if (!config.snapshots.trim()) {
    throw new Error('Visual testing snapshot directory is required.');
  }

  return makeEnvironmentProviders([
    {
      provide: VISUAL_TESTING_CONFIG,
      useValue: Object.freeze({ ...config }),
    } satisfies Provider,
    provideEnvironmentInitializer(() => {
      installBrowserRuntime(inject(ApplicationRef));
    }),
  ]);
}
