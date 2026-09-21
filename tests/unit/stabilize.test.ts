import { describe, expect, it, vi } from 'vitest';
import { waitForAngularStable, waitForFonts } from '../../src/angular/stabilize.js';

describe('waitForAngularStable', () => {
  it('waits for the Angular application to become stable', async () => {
    let resolveStable!: () => void;
    const whenStable = new Promise<void>((resolve) => {
      resolveStable = resolve;
    });

    const applicationRef = {
      whenStable: vi.fn(() => whenStable),
    } as any;

    const promise = waitForAngularStable(applicationRef, 100);
    resolveStable();

    await expect(promise).resolves.toBeUndefined();
    expect(applicationRef.whenStable).toHaveBeenCalledOnce();
  });

  it('times out when Angular never becomes stable', async () => {
    const applicationRef = {
      whenStable: vi.fn(() => new Promise<void>(() => {})),
    } as any;

    await expect(waitForAngularStable(applicationRef, 1))
      .rejects.toThrow('Angular application did not become stable within 1ms.');
  });
});

describe('waitForFonts', () => {
  it('resolves when the document font set is ready', async () => {
    const ready = Promise.resolve();
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready },
    });

    await expect(waitForFonts(100)).resolves.toBeUndefined();
  });
});
