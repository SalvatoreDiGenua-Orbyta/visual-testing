import { Component, input } from '@angular/core';

@Component({
  selector: 'vt-button',
  standalone: true,
  template: `
    <button
      class="button"
      [disabled]="disabled()"
      [attr.data-variant]="variant()"
    >
      {{ label() }}
    </button>
  `,
})
export class FixtureButtonComponent {
  label = input('Default');
  disabled = input(false);
  variant = input<'primary' | 'secondary'>('primary');
}
