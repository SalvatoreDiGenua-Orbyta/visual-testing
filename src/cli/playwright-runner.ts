import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import type { VisualFilter } from '../runner/filter.js';
import { aggregateResults, type VisualRunSummary } from '../runner/aggregate.js';
import type { VisualResult } from '../runner/status.js';
import type { VisualWorkspace } from './workspace.js';

export interface PlaywrightRunnerOptions {
  readonly workspace: VisualWorkspace;
  readonly snapshotRoot: string;
  readonly resultsRoot: string;
  readonly definitions: string;
  readonly update: boolean;
  readonly filter: VisualFilter;
}

export async function runPlaywrightVisuals(options: PlaywrightRunnerOptions): Promise<VisualRunSummary> {
  const tempRoot = await mkdtemp(join(options.workspace.workspaceRoot, '.visual-testing-'));
  const configPath = join(tempRoot, 'playwright.config.ts');
  const specPath = join(tempRoot, 'visual-testing.spec.ts');
  const resultPath = join(tempRoot, 'results.json');
  try {
    await writeFile(configPath, createConfig(options, tempRoot), 'utf8');
    await writeFile(specPath, createSpec(options, resultPath), 'utf8');
    const exit = await runPlaywright(options.workspace.workspaceRoot, configPath);
    let results: VisualResult[];
    try {
      results = JSON.parse(await readFile(resultPath, 'utf8')) as VisualResult[];
    } catch {
      throw new Error(exit !== 0
        ? `Playwright visual test runner failed before producing results (exit code ${exit}).`
        : 'Playwright visual test runner completed without producing results.');
    }
    return aggregateResults(results);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

function createConfig(options: PlaywrightRunnerOptions, tempRoot: string): string {
  const snapshotRelative = relative(tempRoot, resolve(options.snapshotRoot)).replace(/\\\\/g, '/');
  const snapshotPath = snapshotRelative ? `{configDir}/${snapshotRelative}/{arg}{ext}` : '{configDir}/{arg}{ext}';
  const command = `npx ng serve ${options.workspace.projectName} --host 127.0.0.1 --port 4200 --no-open`;
  return [
    `import { defineConfig } from '@playwright/test';`,
    '',
    'export default defineConfig({',
    `  testDir: ${JSON.stringify(tempRoot)},`,
    `  testMatch: 'visual-testing.spec.ts',`,
    `  outputDir: ${JSON.stringify(resolve(options.resultsRoot))},`,
    `  snapshotPathTemplate: ${JSON.stringify(snapshotPath)},`,
    '  workers: 1,',
    '  fullyParallel: false,',
    '  projects: [{',
    "    name: 'chromium',",
    '    use: {',
    "      browserName: 'chromium',",
    '      viewport: { width: 1024, height: 800 },',
    '    },',
    '  }],',
    '  webServer: {',
    `    command: ${JSON.stringify(command)},`,
    `    cwd: ${JSON.stringify(options.workspace.workspaceRoot)},`,
    "    url: 'http://127.0.0.1:4200',",
    '    reuseExistingServer: false,',
    '    timeout: 120_000,',
    '  },',
    "  expect: { toHaveScreenshot: { animations: 'disabled' } },",
    '});',
    '',
  ].join('\\n');
}

function createSpec(options: PlaywrightRunnerOptions, resultPath: string): string {
  const relativeDefinitions = relative(options.workspace.projectRoot, resolve(options.workspace.projectRoot, options.definitions)).replace(/\\\\/g, '/').replace(/^\.\//, '');
  const definitionsUrl = `http://127.0.0.1:4200/${relativeDefinitions}`;
  return [
    "import { writeFile } from 'node:fs/promises';",
    "import { expect, test } from '@playwright/test';",
    '',
    `const resultPath = ${JSON.stringify(resultPath)};`,
    `const definitionsUrl = ${JSON.stringify(definitionsUrl)};`,
    `const update = ${JSON.stringify(options.update)};`,
    `const filter = ${JSON.stringify(options.filter)};`,
    'const results = [];',
    '',
    "test('visual testing', async ({ page }) => {",
    "  await page.goto('/');",
    '  await page.waitForFunction(() => Boolean(window.__visualTestingRuntime));',
    '  const runtime = (window as unknown as { __visualTestingRuntime: { loadDefinitions(url: string): Promise<number>; listDefinitions(): Array<{ component: string; name: string; variants: string[] }>; runVariant(definition: string, variant: string): Promise<string>; destroyVariant(): void } }).__visualTestingRuntime;',
    '  await runtime.loadDefinitions(definitionsUrl);',
    '  const definitions = runtime.listDefinitions();',
    '  for (const definition of definitions) {',
    '    if (filter.component && definition.component !== filter.component) continue;',
    '    for (const variant of definition.variants) {',
    '      if (filter.variant && variant !== filter.variant) continue;',
    '      const identity = { component: definition.component, definition: definition.name, variant };',
    '      try {',
    '        const id = await runtime.runVariant(definition.name, variant);',
    `        const target = page.locator('[data-visual-testing-instance="' + id + '"]');`,
    "        await expect(target).toHaveScreenshot([definition.component, definition.name, variant + '.png'], { animations: 'disabled', updateSnapshot: update ? 'all' : 'none' });",
    "        results.push({ status: 'PASS', ...identity });",
    '      } catch (error) {',
    '        const message = error instanceof Error ? error.message : String(error);',
    "        const status = /snapshot.*(does not exist|doesn't exist)|snapshot.*not found/i.test(message) ? 'WARNING' : /toHaveScreenshot|screenshot comparison|pixel/i.test(message) ? 'VISUAL DIFFERENCE' : 'ERROR';",
    '        results.push({ status, ...identity, message });',
    '      } finally {',
    '        runtime.destroyVariant();',
    '      }',
    '    }',
    '  }',
    "  await writeFile(resultPath, JSON.stringify(results), 'utf8');",
    '});',
    '',
  ].join('\\n');
}

function runPlaywright(cwd: string, configPath: string): Promise<number> {
  return new Promise((resolvePromise, reject) => {
    const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawn(command, ['playwright', 'test', '--config', configPath], { cwd, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) => resolvePromise(code ?? 2));
  });
}