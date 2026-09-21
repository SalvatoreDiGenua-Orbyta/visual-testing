import type { VisualDefinition } from '../definitions/types.js';
import { filterDefinitions, type VisualFilter } from './filter.js';
import { runDefinition, type VisualRunnerOptions } from './visual-runner.js';
import { aggregateResults, type VisualRunSummary } from './aggregate.js';

export interface RunOptions extends VisualRunnerOptions {
  readonly filter?: VisualFilter;
}

export async function runVisuals(
  definitions: readonly VisualDefinition<unknown>[],
  options: RunOptions,
): Promise<VisualRunSummary> {
  const selected = filterDefinitions(definitions, options.filter ?? {});
  const results = [];

  for (const definition of selected) {
    const definitionResults = await runDefinition(definition, options);
    results.push(...definitionResults);

    if (definitionResults.some((result) => result.status === 'ERROR')) {
      break;
    }
  }

  return aggregateResults(results);
}
