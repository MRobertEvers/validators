import { Validator, ValidatorResult } from './Validator';

enum ValidatorPrimitiveType {
	STRING = 'ValidatorPrimitiveType/STRING',
	NUMBER = 'ValidatorPrimitiveType/NUMBER',
	BOOLEAN = 'ValidatorPrimitiveType/BOOLEAN'
}

function match(field: any, type: ValidatorPrimitiveType) {
	switch (type) {
		case ValidatorPrimitiveType.NUMBER:
			return typeof field === 'number';
		case ValidatorPrimitiveType.STRING:
			return typeof field === 'string';
		case ValidatorPrimitiveType.BOOLEAN:
			return typeof field === 'boolean';
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
		case ValidatorPrimitiveType.BOOLEAN: {
			if (typeof field === 'boolean') {
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
		return new Primitive(ValidatorPrimitiveType.STRING);
	}

	static boolean(): Primitive<boolean> {
		return new Primitive(ValidatorPrimitiveType.BOOLEAN);
	}
}

export class PrimitiveValidator<T> implements Validator<T> {
	primitive: Primitive<T>;
	allowCoercion: boolean;

	constructor(
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

export class NumberValidator extends PrimitiveValidator<number> {
	constructor(args: { allowCoercion: boolean }) {
		super(Primitive.number(), { allowCoercion: args.allowCoercion });
	}
}

export class StringValidator extends PrimitiveValidator<string> {
	constructor() {
		super(Primitive.string(), { allowCoercion: false });
	}
}

export class BooleanValidator extends PrimitiveValidator<boolean> {
	constructor() {
		super(Primitive.boolean(), { allowCoercion: false });
	}
}
