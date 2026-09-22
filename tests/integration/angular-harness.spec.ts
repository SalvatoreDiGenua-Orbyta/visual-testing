import { expect, test } from '@playwright/test';

test('renders a real Angular component through the visual testing runtime', async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const unhandledRejections: string[] = [];

  page.on('pageerror', (error) => {
    pageErrors.push(error.stack ?? error.message);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    if (failure) {
      consoleErrors.push(`Request failed: ${request.url()} — ${failure.errorText}`);
    }
  });

  await page.addInitScript(() => {
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.stack ?? reason.message : String(reason);
      (window as unknown as { __visualTestingUnhandledRejections?: string[] })
        .__visualTestingUnhandledRejections ??= [];
      (window as unknown as { __visualTestingUnhandledRejections: string[] })
        .__visualTestingUnhandledRejections.push(message);
    });
  });

  await page.goto('/');

  try {
    await page.waitForFunction(
      () =>
        Boolean(
          (window as unknown as { __angularBootstrapCompleted?: boolean })
            .__angularBootstrapCompleted,
        ),
      undefined,
      { timeout: 10_000 },
    );
  } catch (error) {
    const browserRejections = await page.evaluate(
      () =>
        (window as unknown as { __visualTestingUnhandledRejections?: string[] })
          .__visualTestingUnhandledRejections ?? [],
    );
    unhandledRejections.push(...browserRejections);

    throw new Error(
      [
        error instanceof Error ? error.message : String(error),
        pageErrors.length ? `Page errors:\n${pageErrors.join('\n')}` : '',
        consoleErrors.length ? `Console errors:\n${consoleErrors.join('\n')}` : '',
        unhandledRejections.length
          ? `Unhandled rejections:\n${unhandledRejections.join('\n')}` : '',
      ].filter(Boolean).join('\n\n'),
    );
  }

  await page.waitForFunction(
    () =>
      Boolean(
        (window as unknown as { __visualTestingRuntime?: unknown })
          .__visualTestingRuntime,
      ),
    undefined,
    { timeout: 10_000 },
  );

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
