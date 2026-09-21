import type { ApplicationRef } from '@angular/core';

export async function waitForAngularStable(applicationRef: ApplicationRef, timeoutMs = 5000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (applicationRef.isStable) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`Angular application did not become stable within ${timeoutMs}ms.`);
}

export async function waitForFonts(timeoutMs = 5000): Promise<void> {
  if (!document.fonts?.ready) return;
  await Promise.race([
    document.fonts.ready,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Fonts did not become ready within ${timeoutMs}ms.`)), timeoutMs)),
  ]);
}
