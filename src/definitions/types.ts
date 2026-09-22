import type { Provider, Type, InputSignal, InputSignalWithTransform } from '@angular/core';

export type ComponentInputValue<T> =
  T extends InputSignalWithTransform<infer _Read, infer Write> ? Write :
  T extends InputSignal<infer Read> ? Read : T;

export type ComponentInputs<TComponent> = {
  [K in keyof TComponent as TComponent[K] extends (...args: never[]) => unknown ? never : K]?: ComponentInputValue<TComponent[K]>;
};

export interface VisualVariant<TComponent> {
  readonly name: string;
  readonly inputs?: ComponentInputs<TComponent>;
}

export interface VisualDefinition<TComponent> {
  readonly name: string;
  readonly component: Type<TComponent>;
  readonly variants: readonly VisualVariant<TComponent>[];
  readonly providers?: readonly Provider[];
}

export interface VisualTestingConfig {
  readonly definitions: string;
  readonly snapshots: string;
}
