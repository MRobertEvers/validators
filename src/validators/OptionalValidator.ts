import { Validator, ValidatorResult } from './Validator';

export class OptionalValidator<T> implements Validator<T | null> {
	private validator: Validator<T>;
	constructor(validator: Validator<T>) {
		this.validator = validator;
	}

	get type(): string {
		return `Optional<${this.validator.type}>`;
	}

	coerce(field: any): T | undefined | null {
		if (typeof field === 'undefined') {
			return null;
		} else {
			return this.validator.coerce(field);
		}
	}

	validate(fieldName: string, field: any): ValidatorResult<T | null> {
		if (typeof field === 'undefined') {
			return ValidatorResult.success({
				coerced: null
			});
		} else {
			return this.validator.validate(fieldName, field);
		}
	}
}
