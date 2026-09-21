import {
  Component,
  Input,
  InputSignal,
  InputSignalWithTransform,
  input,
} from '@angular/core';

export type InputValue<T> =
  T extends InputSignalWithTransform<infer _Read, infer Write>
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

export type SignalInputsCandidate = CandidateComponentInputs<SignalInputsComponent>;
export type LegacyInputsCandidate = CandidateComponentInputs<LegacyInputsComponent>;

declare const signalInputs: SignalInputsCandidate;
signalInputs.title = 'custom';
signalInputs.requiredTitle = 'required';
signalInputs.transformed = 'true';
signalInputs.count = 3;
signalInputs.tags = ['a', 'b'];
// @ts-expect-error signal input must reject the wrong write type.
signalInputs.count = '3';
// @ts-expect-error ordinary fields must not be exposed as inputs.
signalInputs.ordinaryField = 'wrong';

declare const legacyInputs: LegacyInputsCandidate;
legacyInputs.title = 'custom';
legacyInputs.requiredTitle = 'required';
legacyInputs.count = 3;
// NOTE: legacy @Input({ transform }) is exposed using its property type.
// TypeScript cannot recover Angular's transform write type without private ɵ APIs.
legacyInputs.transformed = false;
// @ts-expect-error legacy property type still rejects unrelated values.
legacyInputs.count = '3';
// @ts-expect-error methods must not be exposed as inputs.
legacyInputs.helper = () => {};
