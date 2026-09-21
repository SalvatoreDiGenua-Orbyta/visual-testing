import {
  Component,
  Input,
  InputSignal,
  InputSignalWithTransform,
  input,
} from '@angular/core';

/**
 * Candidate type utility for the public API.
 *
 * Signal inputs expose their accepted write type through Angular's public
 * InputSignalWithTransform<T, TransformT> type.
 *
 * Legacy @Input() properties do not leave a type-level marker on the class
 * property, so TypeScript alone cannot distinguish them from ordinary fields.
 */
export type InputValue<T> =
  T extends InputSignalWithTransform<unknown, infer Write>
    ? Write
    : T extends InputSignal<infer Read>
      ? Read
      : T;

export type CandidateComponentInputs<TComponent> = {
  [K in keyof TComponent as TComponent[K] extends (...args: never[]) => unknown
    ? never
    : K]?: InputValue<TComponent[K]>;
};

@Component({
  selector: 'visual-input-spike',
  template: '',
})
export class SignalInputsComponent {
  title = input('default');
  requiredTitle = input.required<string>();
  transformed = input(false, {
    transform: (value: string | boolean) => value === true || value === 'true',
  });
  count = input(0);
  tags = input<string[]>([]);
  ordinaryField = 'not-an-input';
}

@Component({
  selector: 'visual-legacy-input-spike',
  template: '',
})
export class LegacyInputsComponent {
  @Input() title = 'default';

  @Input({ required: true })
  requiredTitle!: string;

  @Input({ alias: 'count-value' })
  count = 0;

  @Input({ transform: (value: string | boolean) => value === true || value === 'true' })
  transformed = false;

  ordinaryField = 'not-an-input';

  helper(): void {}
}

export type SignalInputsCandidate =
  CandidateComponentInputs<SignalInputsComponent>;

export type LegacyInputsCandidate =
  CandidateComponentInputs<LegacyInputsComponent>;
