import type { VisualResult } from './status.js';

export function formatResult(result: VisualResult): string {
  const id = `${result.component} / ${result.definition} / ${result.variant}`;
  return result.message ? `[${result.status}] ${id} — ${result.message}` : `[${result.status}] ${id}`;
}

export function report(results: readonly VisualResult[]): string {
  return results.map(formatResult).join('\n');
}
