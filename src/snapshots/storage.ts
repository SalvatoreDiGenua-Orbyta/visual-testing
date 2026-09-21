import { mkdir, rm } from 'node:fs/promises';
import type { VisualDefinition } from '../definitions/types.js';
import { snapshotPath } from './path.js';
import type { VisualFilter } from '../runner/filter.js';

export async function prepareSnapshotUpdate(
  root: string,
  definitions: readonly VisualDefinition<unknown>[],
  filter: VisualFilter,
): Promise<void> {
  if (!filter.component && !filter.variant) {
    await rm(root, { recursive: true, force: true });
    await mkdir(root, { recursive: true });
    return;
  }

  for (const definition of definitions) {
    const component = definition.component.name || 'anonymous';
    if (filter.component && component !== filter.component) continue;

    for (const variant of definition.variants) {
      if (filter.variant && variant.name !== filter.variant) continue;
      await rm(snapshotPath(root, definition, variant), { force: true });
    }
  }

  await mkdir(root, { recursive: true });
}
