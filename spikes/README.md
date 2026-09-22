# Angular input type spike

## Goal

Determine how far the public defineVisual({ component, variants }) API can derive
variant input types directly from an Angular component class, without consumer-side
input interfaces and without Angular private ɵ APIs.

## Findings

### Signal inputs

Angular's public InputSignalWithTransform<T, TransformT> type carries both the
read type and the accepted write/transform type. A conditional type can therefore
recover the value that should be accepted by a visual variant.

This covers input(), input.required(), input() with transforms, unions, complex
values, optional signal inputs, and signal input aliases at runtime.

### Legacy @Input()

The class property type remains visible to TypeScript, but the fact that a property
was decorated with @Input() is not represented in the TypeScript type of the class.
Therefore a mapped type over keyof TComponent cannot distinguish an actual input
from an ordinary public field.

The candidate utility intentionally demonstrates this limitation: ordinaryField
is accepted by the type system.

## Decision required before Task 3

The spike should not be hidden behind Angular private ɵ APIs.

Possible strategies are:

1. Accept a type-level superset of legacy public properties and rely on Angular
   runtime input metadata to ignore unknown/non-input keys.
2. Introduce code generation/compiler metadata for exact legacy input typing.
3. Restrict exact static input typing to signal inputs and document the limitation.

For the current MVP, option 1 is the smallest architecture and keeps the consumer
API free of manually maintained input interfaces. Runtime input application will
still resolve real Angular inputs through Angular metadata.

## Verification

Run:

    npm install
    npm run typecheck:spike

The spike intentionally passes while demonstrating that ordinaryField is part of
the candidate legacy shape. That is the architectural limitation to address
before finalizing ComponentInputs<TComponent>.
