import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  testMatch: '**/*.spec.ts',
  use: {
    baseURL: 'http://127.0.0.1:4300',
    browserName: 'chromium',
    viewport: { width: 1024, height: 800 },
  },
  webServer: {
    command: 'npx ng serve --host 127.0.0.1 --port 4300 --no-hmr --prebundle=false',
    cwd: 'fixtures/angular-app',
    url: 'http://127.0.0.1:4300/',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
