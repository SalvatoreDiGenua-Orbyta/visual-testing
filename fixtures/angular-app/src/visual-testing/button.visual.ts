import { defineVisual } from 'visual-testing';
import { FixtureButtonComponent } from '../app.component';

export default defineVisual({
  name: 'states',
  component: FixtureButtonComponent,
  variants: [
    { name: 'default' },
    { name: 'disabled', inputs: { disabled: true } },
    { name: 'secondary', inputs: { variant: 'secondary' } },
  ],
});
