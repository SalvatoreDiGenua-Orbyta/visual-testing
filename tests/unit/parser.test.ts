import { describe, expect, it } from 'vitest';
import { parseArgs } from '../../src/cli/parser.js';

describe('parseArgs', () => {
  it('parses test filters', () => expect(parseArgs(['test', 'button', '--variant', 'disabled'])).toEqual({
    command: 'test', component: 'button', variant: 'disabled',
  }));
  it('defaults to help', () => expect(parseArgs([])).toEqual({ command: 'help' }));
});
