# visual-testing

Angular visual regression testing library powered by Playwright.

## Status

Early development. The core definition, Angular harness, stabilization,
snapshot identity, Playwright screenshot adapter, filtering, result statuses,
and CLI argument parser are implemented on this feature branch.

## Public API

The public surface is intentionally small:

```ts
import { defineVisual, provideVisualTesting } from 'visual-testing';

defineVisual({
  name: 'states',
  component: ButtonComponent,
  variants: [
    { name: 'default' },
    { name: 'disabled', inputs: { disabled: true } },
  ],
});

provideVisualTesting({
  definitions: './src/visual-testing/index.ts',
  snapshots: './visual-snapshots',
});
```

Definitions are collected from an explicit entrypoint whose default export is an
array of definitions. Each definition has one or more independently named
variants.

## Runtime model

Each variant receives a fresh Angular component instance. Inputs are applied
with Angular's public `ComponentRef.setInput()` API. The runner waits for
Angular stability and fonts, targets the component host element, and uses
Playwright screenshot assertions with Chromium at 1024x800 and animations
disabled.

## Remaining integration work

The CLI still needs the consumer-application loading contract and the full
`test`, `update`, and `init` orchestration. That boundary was intentionally
left separate from the core runtime because it determines how the real
application injector is loaded without exposing internal harness/runner classes.

The Angular input spike also documents the public-type limitation for legacy
`@Input()`: TypeScript cannot distinguish an input property from another
public class property without compiler/private Angular metadata.
