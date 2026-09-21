# visual-testing

Angular visual regression testing library powered by Playwright.

## Status

Early development. The repository is currently establishing the package
structure and validating the public TypeScript API constraints.

## Design

The MVP targets:

- Angular >= 19
- standalone components
- Playwright/Chromium for visual comparison
- component definitions collected from an explicit entrypoint
- type-safe visual variants derived from the component type
- a small public API centered on defineVisual() and provideVisualTesting()

## Development

The first milestone is the Angular input type spike. It verifies what can be
derived from public Angular/TypeScript types before the public definition API is
implemented.

    npm install
    npm run typecheck:spike
