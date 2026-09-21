import type { ApplicationRef } from '@angular/core';

export async function waitForAngularStable(
  applicationRef: ApplicationRef,
  timeoutMs = 5000,
): Promise<void> {
  await Promise.race([
    applicationRef.whenStable(),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Angular application did not become stable within ${timeoutMs}ms.`)),
        timeoutMs,
      ),
    ),
  ]);
}

export async function waitForFonts(timeoutMs = 5000): Promise<void> {
  if (!document.fonts?.ready) return;

  await Promise.race([
    document.fonts.ready,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Fonts did not become ready within ${timeoutMs}ms.`)),
        timeoutMs,
      ),
    ),
  ]);
}
