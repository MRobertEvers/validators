export interface ValidatorErrorDescription {
	fieldName: string;
	fieldValue: string;
	expectedType: string;
	stack?: ValidatorErrorDescription[];
}

export class CoercionError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export class ValidatorResult<T> {
	coerced?: T;
	errors: Array<ValidatorErrorDescription>;

	private constructor(args: { coerced?: T; errors?: Array<ValidatorErrorDescription> }) {
		this.coerced = args.coerced;
		this.errors = args.errors;
	}

	isValid(): boolean {
		return this.errors.length === 0 && typeof this.coerced !== 'undefined';
	}

	asCoerced(): T {
		if (!this.isValid()) {
			throw new CoercionError('Cannot coerce invalid field to expected type.');
		}

		return this.coerced!;
	}

	static error<R>(args: { errors: Array<ValidatorErrorDescription> }): ValidatorResult<R> {
		return new ValidatorResult({
			errors: args.errors
		});
	}

	static success<R>(args: { coerced: R }): ValidatorResult<R> {
		return new ValidatorResult({
			coerced: args.coerced
		});
	}
}

export interface Validator<T> {
	type: string;

	coerce(field: any): T | undefined;
	validate(fieldName: string, field: any): ValidatorResult<T>;
}
