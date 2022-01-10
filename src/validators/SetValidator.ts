import { Validator, ValidatorResult } from './Validator';

export class SetValidator<T> implements Validator<T> {
	valid: T[];
	constructor(args: T[]) {
		this.valid = args;
	}

	get type(): string {
		return `SetValidator<${this.valid.join(' | ')}>`;
	}

	coerce(field: any): T | undefined {
		const s = new Set(this.valid);
		if (!s.has(field)) {
			return;
		}
		return field;
	}

	validate(fieldName: string, field: any): ValidatorResult<T> {
		const s = new Set(this.valid);
		if (!s.has(field)) {
			return ValidatorResult.error({
				errors: [
					{
						fieldName: fieldName,
						fieldValue: JSON.stringify(field),
						expectedType: this.type
					}
				]
			});
		}

		return ValidatorResult.success({
			coerced: this.coerce(field)!
		});
	}
}
