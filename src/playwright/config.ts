import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

export function createVisualPlaywrightConfig(snapshotDir: string): PlaywrightTestConfig {
  return defineConfig({
    snapshotDir,
    projects: [{
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1024, height: 800 },
      },
    }],
    expect: {
      toHaveScreenshot: { animations: 'disabled' },
    },
  });
}
