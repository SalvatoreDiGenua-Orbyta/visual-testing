import { expect, type Locator } from '@playwright/test';

export interface VisualScreenshotAdapter {
  compare(target: Locator, snapshotName: string, update: boolean): Promise<void>;
}

export class PlaywrightScreenshotAdapter implements VisualScreenshotAdapter {
  async compare(target: Locator, snapshotName: string, update: boolean): Promise<void> {
    await expect(target).toHaveScreenshot(snapshotName, {
      animations: 'disabled',
      ...(update ? { updateSnapshot: 'all' as const } : {}),
    });
  }
}
