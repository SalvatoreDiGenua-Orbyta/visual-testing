import { describe, expect, it } from 'vitest';
import { aggregateResults } from '../../src/runner/aggregate.js';

describe('aggregateResults', () => {
  it('counts statuses and preserves result order', () => {
    const results = [
      { status: 'PASS' as const, component: 'Button', definition: 'states', variant: 'default' },
      { status: 'WARNING' as const, component: 'Button', definition: 'states', variant: 'disabled' },
      { status: 'VISUAL DIFFERENCE' as const, component: 'Input', definition: 'states', variant: 'default' },
      { status: 'ERROR' as const, component: 'Card', definition: 'states', variant: 'default' },
    ];

    expect(aggregateResults(results)).toEqual({
      results,
      passed: 1,
      warnings: 1,
      differences: 1,
      errors: 1,
      exitCode: 2,
    });
  });

  it('returns success for passes and warnings only', () => {
    const summary = aggregateResults([
      { status: 'PASS', component: 'Button', definition: 'states', variant: 'default' },
      { status: 'WARNING', component: 'Button', definition: 'states', variant: 'missing' },
    ]);

    expect(summary.exitCode).toBe(0);
    expect(summary.passed).toBe(1);
    expect(summary.warnings).toBe(1);
  });
});
