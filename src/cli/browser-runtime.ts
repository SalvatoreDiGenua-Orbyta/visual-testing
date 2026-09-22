import type { ApplicationRef, ComponentRef } from '@angular/core';
import type { VisualDefinition } from '../definitions/types.js';
import { createVisualHarness } from '../angular/harness.js';
import { waitForAngularStable, waitForFonts } from '../angular/stabilize.js';
import { applyInputs } from '../runner/input-application.js';

interface BrowserVisualRuntime {
  readonly applicationRef: ApplicationRef;
  readonly definitions?: readonly VisualDefinition<unknown>[];
  readonly active?: {
    readonly id: string;
    readonly harness: ReturnType<typeof createVisualHarness>;
  };
  loadDefinitions(moduleUrl: string): Promise<number>;
  runVariant(definitionName: string, variantName: string): Promise<string>;
  destroyVariant(): void;
}

const RUNTIME_KEY = '__visualTestingRuntime';

export function installBrowserRuntime(
  applicationRef: ApplicationRef,
): void {
  if (typeof window === 'undefined') return;

  let definitions: readonly VisualDefinition<unknown>[] | undefined;
  let active: BrowserVisualRuntime['active'];

  const runtime: BrowserVisualRuntime = {
    applicationRef,

    async loadDefinitions(moduleUrl) {
      const module = (await import(/* @vite-ignore */ moduleUrl)) as {
        default: readonly VisualDefinition<unknown>[];
      };

      if (!Array.isArray(module.default)) {
        throw new Error('Visual definitions entrypoint must default-export an array.');
      }

      definitions = module.default;
      return definitions.length;
    },

    async runVariant(definitionName, variantName) {
      if (!definitions) {
        throw new Error('Visual definitions have not been loaded.');
      }

      runtime.destroyVariant();

      const definition = definitions.find((item) => item.name === definitionName);
      if (!definition) {
        throw new Error(`Visual definition "${definitionName}" was not found.`);
      }

      const variant = definition.variants.find((item) => item.name === variantName);
      if (!variant) {
        throw new Error(
          `Visual variant "${variantName}" was not found in definition "${definitionName}".`,
        );
      }

      const id = `visual-testing-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const harness = createVisualHarness(
        applicationRef,
        definition.component,
        definition.providers ?? [],
      );
      harness.host.dataset.visualTestingInstance = id;

      try {
        applyInputs(harness.componentRef, variant.inputs);
        harness.componentRef.changeDetectorRef.detectChanges();
        await waitForAngularStable(applicationRef);
        await waitForFonts();
      } catch (error) {
        harness.destroy();
        throw error;
      }

      active = { id, harness };
      return id;
    },

    destroyVariant() {
      active?.harness.destroy();
      active = undefined;
    },
  };

  window[RUNTIME_KEY] = runtime;
}

declare global {
  interface Window {
    __visualTestingRuntime?: BrowserVisualRuntime;
  }
}
