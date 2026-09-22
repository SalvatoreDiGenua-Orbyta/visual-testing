import { join, normalize } from 'node:path';
import type { VisualDefinition, VisualVariant } from '../definitions/types.js';
import { componentName } from '../runner/filter.js';

export function snapshotPath<T>(root: string, definition: VisualDefinition<T>, variant: VisualVariant<T>): string {
  return normalize(join(root, componentName(definition as VisualDefinition<unknown>), definition.name, `${variant.name}.png`));
}
