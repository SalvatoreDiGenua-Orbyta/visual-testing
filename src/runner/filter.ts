import type { VisualDefinition } from '../definitions/types.js';

export interface VisualFilter { readonly component?: string; readonly variant?: string; }

export function componentName(definition: VisualDefinition<unknown>): string {
  return definition.component.name || 'anonymous';
}

export function filterDefinitions(definitions: readonly VisualDefinition<unknown>[], filter: VisualFilter): readonly VisualDefinition<unknown>[] {
  return definitions
    .filter((d) => !filter.component || componentName(d) === filter.component)
    .map((d) => ({ ...d, variants: d.variants.filter((v) => !filter.variant || v.name === filter.variant) }))
    .filter((d) => d.variants.length > 0);
}
