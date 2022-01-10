import { pickMap } from '../utils/pick-map';
import { Scheme } from './support';
import { Validator, ValidatorErrorDescription, ValidatorResult } from './Validator';

function keysOfScheme<T>(scheme: T): Array<keyof T> {
	return Object.keys(scheme) as any;
}

export class SchemeValidator<T extends Record<string, Validator<any>>>
	implements Validator<Scheme<T>>
{
	scheme: T;
	constructor(scheme: T) {
		this.scheme = scheme;
	}

	get type(): string {
		return `SchemeValidator<{${Object.entries(this.scheme)
			.map(([key, val]) => `${key}: ${val.type}`)
			.join('; ')}}>`;
	}

	coerce(field: any): Scheme<T> | undefined {
		if (!field || typeof field !== 'object' || Array.isArray(field)) {
			return;
		}

		const coersion = Object.entries(this.scheme).reduce((m, [key, val]) => {
			m[key] = val.coerce(field[key]);
			return m;
		}, {} as Record<string, T>);

		if (Object.values(coersion).find((c) => typeof c === 'undefined')) {
			return;
		}

		return coersion as Scheme<T>;
	}

	validate(fieldName: string, field: any): ValidatorResult<Scheme<T>> {
		if (!field || typeof field !== 'object' || Array.isArray(field)) {
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

		const keys = keysOfScheme(this.scheme);
		const picked = pickMap(field, keys);

		const errors: Array<ValidatorErrorDescription> = [];

		for (const [validFieldName, validator] of Object.entries(this.scheme)) {
			const fv = picked[validFieldName];
			const result = validator.validate(`${fieldName}.${validFieldName}`, fv);
			if (!result.isValid()) {
				errors.push(...result.errors);
			}
		}

		const coerced = this.coerce(picked);
		if (errors.length !== 0 || typeof coerced === 'undefined') {
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
			coerced: coerced
		});
	}
}
