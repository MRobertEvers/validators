import { Validator, ValidatorResult } from './Validator';

enum ValidatorPrimitiveType {
	STRING = 'ValidatorPrimitiveType/STRING',
	NUMBER = 'ValidatorPrimitiveType/NUMBER'
}

function match(field: any, type: ValidatorPrimitiveType) {
	switch (type) {
		case ValidatorPrimitiveType.NUMBER:
			return typeof field === 'number';
		case ValidatorPrimitiveType.STRING:
			return typeof field === 'string';
		default:
			return false;
	}
}

function coerce<T>(field: any, primitive: Primitive<T>): T | undefined {
	switch (primitive.type) {
		case ValidatorPrimitiveType.NUMBER: {
			const asNum = parseInt(field, 10);
			if (typeof asNum === 'number' && !isNaN(asNum)) {
				return asNum as unknown as T;
			}
			break;
		}
		case ValidatorPrimitiveType.STRING: {
			if (typeof field === 'string') {
				return field as unknown as T;
			}
			break;
		}
	}

	return;
}

export class Primitive<T> {
	type: ValidatorPrimitiveType;
	private constructor(type: ValidatorPrimitiveType) {
		this.type = type;
	}

	static number(): Primitive<Number> {
		return new Primitive(ValidatorPrimitiveType.NUMBER);
	}

	static string(): Primitive<String> {
		return new Primitive(ValidatorPrimitiveType.NUMBER);
	}
}

export class PrimitiveValidator<T> implements Validator<T> {
	primitive: Primitive<T>;
	allowCoercion: boolean;

	private constructor(
		primitive: Primitive<T>,
		options: {
			allowCoercion: boolean;
		}
	) {
		this.primitive = primitive;
		this.allowCoercion = options.allowCoercion;
	}

	get type(): string {
		return this.primitive.type.toString();
	}

	coerce(field: any): T | undefined {
		return coerce(field, this.primitive);
	}

	validate(fieldName: string, field: any): ValidatorResult<T> {
		// Coercion happens before validation only for primitive types
		const coerced = this.allowCoercion ? this.coerce(field) : field;

		if (match(coerced, this.primitive.type)) {
			return ValidatorResult.success({
				coerced: coerced
			});
		} else {
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
	}
}
