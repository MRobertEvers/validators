import { Validator } from './Validator';

export type Coerced<C> = C extends Validator<infer T> ? T : undefined;

export type Scheme<Validators> = {
	[key in keyof Validators]: Coerced<Validators[key]>;
};

export type AnyOfScheme<ValidatorsArray> = Coerced<ValidatorsArray[keyof ValidatorsArray]>;
