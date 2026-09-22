#!/usr/bin/env node
import { mkdir, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseArgs } from './parser.js';
import { loadAngularWorkspace } from './workspace.js';
import { resolveVisualCliConfig, resolveVisualPaths } from './config.js';
import { runPlaywrightVisuals } from './playwright-runner.js';
import { prepareSnapshotUpdate } from '../snapshots/storage.js';

const VERSION = '0.1.0';

async function main(): Promise<number> {
  const options = parseArgs(process.argv.slice(2));

  if (options.command === 'help') {
    printHelp();
    return 0;
  }

  if (options.command === 'version') {
    console.log(VERSION);
    return 0;
  }

  const workspace = await loadAngularWorkspace(process.cwd());
  const config = await resolveVisualCliConfig(workspace.projectRoot);
  const paths = resolveVisualPaths(workspace.projectRoot, config);
  const filter = {
    component: options.component,
    variant: options.variant,
  };

  if (options.command === 'init') {
    await initVisualTesting(paths.definitions, paths.snapshots);
    return 0;
  }

  await mkdir(paths.snapshots, { recursive: true });
  const resultsRoot = resolve(workspace.workspaceRoot, 'visual-test-results');

  if (options.command === 'update') {
    await prepareSnapshotUpdate(paths.snapshots, [], filter);
  }

  const summary = await runPlaywrightVisuals({
    workspace,
    snapshotRoot: paths.snapshots,
    resultsRoot,
    definitions: config.definitions,
    update: options.command === 'update',
    filter,
  });

  for (const result of summary.results) {
    const detail = result.message ? ` — ${result.message.split('\\n')[0]}` : '';
    console.log(`[${result.status}] ${result.component}/${result.definition}/${result.variant}${detail}`);
  }

  console.log(
    `\\nPassed: ${summary.passed}, warnings: ${summary.warnings}, differences: ${summary.differences}, errors: ${summary.errors}`,
  );

  return summary.exitCode;
}

async function initVisualTesting(definitions: string, snapshots: string): Promise<void> {
  await mkdir(definitions, { recursive: true });
  await mkdir(snapshots, { recursive: true });
  const entrypoint = join(definitions, 'index.ts');
  try {
    await stat(entrypoint);
  } catch {
    await (await import('node:fs/promises')).writeFile(
      entrypoint,
      'export default [];\\n',
      'utf8',
    );
  }
  console.log(`Visual testing initialized at ${definitions}.`);
}

function printHelp(): void {
  console.log(`visual-testing

Usage:
  npx visual-testing test [component] [--variant <name>]
  npx visual-testing update [component] [--variant <name>]
  npx visual-testing init
  npx visual-testing --help
  npx visual-testing --version
`);
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  });
