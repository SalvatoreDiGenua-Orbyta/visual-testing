import type {
  LegacyInputsCandidate,
  SignalInputsCandidate,
} from './angular-input-types.js';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Assert<T extends true> = T;

type SignalAssertions = [
  Assert<Equal<SignalInputsCandidate['title'], string>>,
  Assert<Equal<SignalInputsCandidate['requiredTitle'], string>>,
  Assert<Equal<SignalInputsCandidate['transformed'], string | boolean>>,
  Assert<Equal<SignalInputsCandidate['count'], number>>,
  Assert<Equal<SignalInputsCandidate['tags'], string[]>>,
  Assert<Equal<SignalInputsCandidate['ordinaryField'], string>>,
];

type LegacyAssertions = [
  Assert<Equal<LegacyInputsCandidate['title'], string>>,
  Assert<Equal<LegacyInputsCandidate['requiredTitle'], string>>,
  Assert<Equal<LegacyInputsCandidate['count'], number>>,
  Assert<Equal<LegacyInputsCandidate['transformed'], boolean>>,
  Assert<Equal<LegacyInputsCandidate['ordinaryField'], string>>,
];
