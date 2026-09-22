import { describe, expect, it, vi } from 'vitest';
import { installBrowserRuntime } from '../../src/cli/browser-runtime.js';

describe('installBrowserRuntime', () => {
  it('does nothing outside a browser', () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: undefined,
    });

    expect(() => installBrowserRuntime({} as never)).not.toThrow();

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });

  it('exposes the runtime on the browser window', () => {
    const originalWindow = globalThis.window;
    const windowMock = {} as Window;

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: windowMock,
    });

    installBrowserRuntime({} as never, { definitions: './src/visual-testing/index.ts', snapshots: './visual-snapshots' });

    expect(windowMock.__visualTestingRuntime).toBeDefined();

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });
});
