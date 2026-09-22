import type { VisualResult } from './status.js';
import { exitCode } from './status.js';

export interface VisualRunSummary {
  readonly results: readonly VisualResult[];
  readonly passed: number;
  readonly warnings: number;
  readonly differences: number;
  readonly errors: number;
  readonly exitCode: 0 | 1 | 2;
}

export function aggregateResults(results: readonly VisualResult[]): VisualRunSummary {
  const passed = results.filter((result) => result.status === 'PASS').length;
  const warnings = results.filter((result) => result.status === 'WARNING').length;
  const differences = results.filter((result) => result.status === 'VISUAL DIFFERENCE').length;
  const errors = results.filter((result) => result.status === 'ERROR').length;

  return {
    results,
    passed,
    warnings,
    differences,
    errors,
    exitCode: exitCode(results),
  };
}
