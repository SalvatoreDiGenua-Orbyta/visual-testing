import { expect, test } from '@playwright/test';

test('renders a real Angular component through the visual testing runtime', async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on('pageerror', (error) => {
    pageErrors.push(error.stack ?? error.message);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/');

  try {
    await page.waitForFunction(
      () => Boolean((window as unknown as { __visualTestingRuntime?: unknown }).__visualTestingRuntime),
      undefined,
      { timeout: 10_000 },
    );
  } catch (error) {
    throw new Error(
      [
        error instanceof Error ? error.message : String(error),
        pageErrors.length ? `Page errors:\n${pageErrors.join('\\n')}` : '',
        consoleErrors.length ? `Console errors:\n${consoleErrors.join('\\n')}` : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    );
  }

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
