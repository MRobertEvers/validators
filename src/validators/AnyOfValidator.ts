import { AnyOfScheme, Coerced } from './support';
import { Validator, ValidatorErrorDescription, ValidatorResult } from './Validator';

export class AnyOfValidator<T> implements Validator<AnyOfScheme<T>> {
	anyOf: T;

	constructor(anyOfScheme: T) {
		this.anyOf = anyOfScheme;
	}

	get type(): string {
		return `AnyOf<${Object.values(this.anyOf)
			.map((v) => v.type)
			.join(' | ')}>`;
	}

	coerce(field: any): AnyOfScheme<T> | undefined {
		for (const validator of Object.values(this.anyOf)) {
			const res = validator.coerce(field);
			if (typeof res !== 'undefined') {
				return res;
			}
		}
	}

	validate(fieldName: string, field: any): ValidatorResult<Coerced<T[keyof T]>> {
		let coerced;
		let errors: Array<ValidatorErrorDescription> = [];
		for (const validator of Object.values(this.anyOf)) {
			const result = validator.validate(fieldName, field);
			if (!result.isValid()) {
				errors.push(...result.errors);
			} else {
				errors = [];
				coerced = result.coerced;
				break;
			}
		}

		if (errors.length !== 0) {
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

		return ValidatorResult.success({
			coerced: coerced
		});
	}
}
