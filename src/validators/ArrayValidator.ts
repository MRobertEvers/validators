import { Validator, ValidatorErrorDescription, ValidatorResult } from './Validator';

export class ArrayValidator<T> implements Validator<Array<T>> {
	private elementValidator: Validator<T>;
	constructor(arrayOf: Validator<T>) {
		this.elementValidator = arrayOf;
	}

	get type(): string {
		return `ArrayOf<${this.elementValidator.type}>`;
	}

	coerce(field: any): T[] | undefined {
		if (!field || !Array.isArray(field)) {
			return;
		}

		const coersion = field.map((v) => this.elementValidator.coerce(v));
		if (coersion.find((c) => typeof c === 'undefined')) {
			return;
		}
		return coersion as Array<T>;
	}

	validate(fieldName: string, field: any): ValidatorResult<T[]> {
		if (!field || !Array.isArray(field)) {
			return ValidatorResult.error({
				errors: [
					{
						fieldValue: JSON.stringify(field),
						fieldName: fieldName,
						expectedType: this.type
					}
				]
			});
		}

		const errors: Array<ValidatorErrorDescription> = [];
		for (let i = 0; i < field.length; i++) {
			const fv = field[i];
			const result = this.elementValidator.validate(`${fieldName}[${i}]`, fv);
			if (!result.isValid()) {
				errors.push(...result.errors);
			}
		}

		const coerced = this.coerce(field);
		if (errors.length !== 0 || typeof coerced === 'undefined') {
			return ValidatorResult.error({
				errors: [
					{
						fieldValue: JSON.stringify(field),
						fieldName: fieldName,
						expectedType: this.type,
						stack: errors
					}
				]
			});
		}

		return ValidatorResult.success({
			coerced: coerced
		});
	}
}
