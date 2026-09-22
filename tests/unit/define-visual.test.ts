import { describe, expect, it } from 'vitest';
import { defineVisual } from '../../src/definitions/define-visual.js';

class ButtonComponent {}

describe('defineVisual', () => {
  it('keeps typed variants', () => {
    const d = defineVisual({ name: 'states', component: ButtonComponent, variants: [
      { name: 'default' }, { name: 'disabled', inputs: { disabled: true } },
    ]});
    expect(d.variants.map((v) => v.name)).toEqual(['default', 'disabled']);
  });
  it('rejects duplicate variants', () => {
    expect(() => defineVisual({ name: 'states', component: ButtonComponent, variants: [
      { name: 'same' }, { name: 'same' },
    ]})).toThrow('duplicate variant');
  });
});
