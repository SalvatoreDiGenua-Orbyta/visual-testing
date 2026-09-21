import { expect, test } from '@playwright/test';

test('renders a real Angular component through the visual harness', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as { __visualHarnessReady?: boolean }).__visualHarnessReady === true);

  const host = page.locator('[data-visual-testing]');
  await expect(host).toHaveCount(1);
  await expect(host.locator('button')).toHaveText('Integration');
  await expect(host.locator('button')).toHaveAttribute('data-variant', 'secondary');

  await expect(host).toHaveScreenshot('fixture-button.png', {
    animations: 'disabled',
    updateSnapshot: 'all',
  });
});
