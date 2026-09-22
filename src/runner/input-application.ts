import type { ComponentRef } from '@angular/core';
import type { ComponentInputs } from '../definitions/types.js';

export function applyInputs<TComponent>(componentRef: ComponentRef<TComponent>, inputs: ComponentInputs<TComponent> | undefined): void {
  if (!inputs) return;
  for (const [name, value] of Object.entries(inputs)) componentRef.setInput(name, value);
}
