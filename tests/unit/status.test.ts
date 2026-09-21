import { describe, expect, it } from 'vitest';
import { exitCode } from '../../src/runner/status.js';

describe('exitCode', () => {
  it('returns 2 for runtime errors', () => expect(exitCode([{ status: 'ERROR', component: 'A', definition: 'd', variant: 'v' }])).toBe(2));
  it('returns 1 for visual differences', () => expect(exitCode([{ status: 'VISUAL DIFFERENCE', component: 'A', definition: 'd', variant: 'v' }])).toBe(1));
  it('returns 0 for warnings', () => expect(exitCode([{ status: 'WARNING', component: 'A', definition: 'd', variant: 'v' }])).toBe(0));
});
