import { readFile, readdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

export interface VisualCliConfig {
  readonly definitions: string;
  readonly snapshots: string;
}

export async function resolveVisualCliConfig(projectRoot: string): Promise<VisualCliConfig> {
  const files = await readdir(projectRoot, { recursive: true, withFileTypes: true });
  for (const entry of files) {
    if (!entry.isFile() || extname(entry.name) !== '.ts') continue;
    const path = resolve(projectRoot, entry.parentPath ?? '', entry.name);
    const source = await readFile(path, 'utf8');
    const match = /provideVisualTesting\s*\(\s*\{([\s\S]*?)\}\s*\)/m.exec(source);
    if (!match) continue;

    const configBlock = match[1];
    if (configBlock === undefined) continue;

    const definitions = readStringProperty(configBlock, 'definitions');
    const snapshots = readStringProperty(configBlock, 'snapshots');
    if (definitions && snapshots) {
      return { definitions, snapshots };
    }
  }

  throw new Error(
    'Could not find provideVisualTesting({ definitions, snapshots }) in the Angular application.',
  );
}

function readStringProperty(source: string, name: string): string | undefined {
  const match = new RegExp(
    String.raw`\b${name}\s*:\s*(['"])(.*?)\1`,
  ).exec(source);
  return match?.[2];
}

export function resolveVisualPaths(projectRoot: string, config: VisualCliConfig) {
  return {
    definitions: resolve(projectRoot, config.definitions),
    snapshots: resolve(projectRoot, config.snapshots),
  };
}
