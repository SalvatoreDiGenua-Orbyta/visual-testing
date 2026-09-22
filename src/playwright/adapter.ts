import { expect, type Locator } from '@playwright/test';

export class VisualDifferenceError extends Error {
  constructor(message: string) { super(message); this.name = 'VisualDifferenceError'; }
}
export class MissingSnapshotError extends Error {
  constructor(message: string) { super(message); this.name = 'MissingSnapshotError'; }
}

export interface VisualScreenshotAdapter {
  compare(target: Locator, snapshotName: string, update: boolean): Promise<void>;
}

export class PlaywrightScreenshotAdapter implements VisualScreenshotAdapter {
  async compare(target: Locator, snapshotName: string, update: boolean): Promise<void> {
    try {
      await expect(target).toHaveScreenshot(snapshotName, {
        animations: 'disabled',
        ...(update ? { updateSnapshot: 'all' as const } : {}),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/snapshot.*(does not exist|doesn't exist)|snapshot.*not found/i.test(message)) {
        throw new MissingSnapshotError(message);
      }
      throw new VisualDifferenceError(message);
    }
  }
}
