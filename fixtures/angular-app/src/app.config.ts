import { ApplicationConfig } from '@angular/core';
import { provideVisualTesting } from 'visual-testing';

export const appConfig: ApplicationConfig = {
  providers: [
    provideVisualTesting({
      definitions: './src/visual-testing/index.ts',
      snapshots: './visual-snapshots',
    }),
  ],
};
