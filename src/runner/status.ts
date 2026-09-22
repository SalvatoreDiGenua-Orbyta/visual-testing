export type VisualStatus = 'PASS' | 'WARNING' | 'VISUAL DIFFERENCE' | 'ERROR';

export interface VisualResult {
  readonly status: VisualStatus;
  readonly component: string;
  readonly definition: string;
  readonly variant: string;
  readonly message?: string;
}

export function exitCode(results: readonly VisualResult[]): 0 | 1 | 2 {
  if (results.some((r) => r.status === 'ERROR')) return 2;
  if (results.some((r) => r.status === 'VISUAL DIFFERENCE')) return 1;
  return 0;
}
