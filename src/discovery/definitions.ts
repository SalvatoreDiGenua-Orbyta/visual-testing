import type { VisualDefinition } from '../definitions/types.js';

export type DefinitionsModule = { default: readonly VisualDefinition<unknown>[] };

export function collectDefinitions(module: DefinitionsModule): readonly VisualDefinition<unknown>[] {
  if (!Array.isArray(module.default)) throw new Error('Visual definitions entrypoint must default-export an array.');
  const names = new Set<string>();
  for (const definition of module.default) {
    if (!definition || typeof definition.name !== 'string') throw new Error('Visual definitions entrypoint contains a malformed definition.');
    if (names.has(definition.name)) throw new Error(`Duplicate visual definition name "${definition.name}".`);
    names.add(definition.name);
  }
  return module.default;
}
