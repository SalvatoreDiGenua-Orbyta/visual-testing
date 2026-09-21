import { defineVisual } from 'visual-testing';
import { FixtureButtonComponent } from '../app.component.js';

export default defineVisual({
  name: 'states',
  component: FixtureButtonComponent,
  variants: [
    { name: 'default' },
    { name: 'disabled', inputs: { disabled: true } },
    { name: 'secondary', inputs: { variant: 'secondary' } },
  ],
});
