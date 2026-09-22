import type { Type } from '@angular/core';
import type { VisualDefinition, VisualVariant } from './types.js';

export function defineVisual<TComponent>(definition: {
  name: string;
  component: Type<TComponent>;
  variants: readonly VisualVariant<TComponent>[];
  providers?: readonly import('@angular/core').Provider[];
}): VisualDefinition<TComponent> {
  if (!definition.name.trim()) throw new Error('Visual definition name cannot be empty.');
  if (definition.variants.length === 0) throw new Error(`Visual definition "${definition.name}" must contain at least one variant.`);
  const names = new Set<string>();
  for (const variant of definition.variants) {
    if (!variant.name.trim()) throw new Error(`Visual definition "${definition.name}" contains an empty variant name.`);
    if (names.has(variant.name)) throw new Error(`Visual definition "${definition.name}" contains duplicate variant "${variant.name}".`);
    names.add(variant.name);
  }
  return Object.freeze({ ...definition, variants: Object.freeze([...definition.variants]) });
}
