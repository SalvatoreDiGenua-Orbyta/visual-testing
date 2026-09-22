import { describe, expect, it } from 'vitest';
import { filterDefinitions } from '../../src/runner/filter.js';

class ButtonComponent {}
const definitions = [
  { name: 'states', component: ButtonComponent, variants: [{ name: 'default' }, { name: 'disabled' }] },
] as any;

describe('filterDefinitions', () => {
  it('filters by component and variant', () => {
    expect(filterDefinitions(definitions, { component: 'ButtonComponent', variant: 'disabled' })).toHaveLength(1);
    expect(filterDefinitions(definitions, { component: 'ButtonComponent', variant: 'missing' })).toHaveLength(0);
  });
});
