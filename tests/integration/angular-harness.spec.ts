import { expect, test } from '@playwright/test';

test('renders a real Angular component through the visual testing runtime', async ({ page }) => {
  await page.goto('/');

  await page.waitForFunction(() => Boolean((window as unknown as { __visualTestingRuntime?: unknown }).__visualTestingRuntime));

  await page.evaluate(async () => {
    const runtime = (window as unknown as {
      __visualTestingRuntime: {
        loadDefinitions(moduleUrl: string): Promise<number>;
        runVariant(definitionName: string, variantName: string): Promise<string>;
      };
    }).__visualTestingRuntime;

    await runtime.loadDefinitions('/src/visual-testing/index.ts');
    await runtime.runVariant('states', 'secondary');
  });

  const host = page.locator('[data-visual-testing]');
  await expect(host).toHaveCount(1);
  await expect(host.locator('button')).toHaveText('Default');
  await expect(host.locator('button')).toHaveAttribute('data-variant', 'secondary');

  await expect(host).toHaveScreenshot('fixture-button.png', {
    animations: 'disabled',
    updateSnapshot: 'all',
  });
});
