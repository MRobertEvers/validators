import { AnyOfValidator } from '../src/validators/AnyOfValidator';
import { ArrayValidator } from '../src/validators/ArrayValidator';
import { BooleanValidator, NumberValidator, StringValidator } from '../src/validators/Primitive';
import { SchemeValidator } from '../src/validators/SchemeValidator';
import { SetValidator } from '../src/validators/SetValidator';
import { CoercionError } from '../src/validators/Validator';

describe('Validators', () => {
	test('Scheme One', () => {
		const validator = new SchemeValidator({
			id: new NumberValidator({ allowCoercion: true })
		});

		const result = validator.validate('query', { id: '1' });
		expect(result.isValid()).toBe(true);

		const coerced = result.asCoerced();
		expect(coerced.id).toBe(1);
	});

	test('Scheme Two', () => {
		const validator = new SchemeValidator({
			id: new SetValidator(['dog' as const, 'cat' as const, 1 as const, 2 as const])
		});

		let result = validator.validate('query', { id: 'clown' });
		expect(result.isValid()).toBe(false);

		result = validator.validate('query', { id: '1' });
		expect(result.isValid()).toBe(false);

		result = validator.validate('query', { id: 2 });
		expect(result.isValid()).toBe(true);
		const coerced = result.asCoerced();
		expect(coerced.id).toBe(2);
	});

	test('Any Of', () => {
		const validator = new AnyOfValidator([
			new NumberValidator({ allowCoercion: false }),
			new SchemeValidator({
				my_field: new StringValidator(),
				my_arr: new ArrayValidator(
					new SetValidator([
						'debug' as const,
						'error' as const,
						'info' as const,
						'silly' as const
					])
				)
			})
		]);

		let result = validator.validate('query', 5);
		expect(result.isValid()).toBe(true);

		let coerced = result.asCoerced();
		expect(coerced).toBe(5);

		result = validator.validate('query', '5');
		expect(result.isValid()).toBe(false);

		result = validator.validate('query', {
			my_field: 'hello',
			my_arr: ['debug', 'error', 'in']
		});
		expect(result.isValid()).toBe(false);

		result = validator.validate('query', {
			my_field: 'hello',
			my_arr: ['debug', 'error', 'info']
		});
		expect(result.isValid()).toBe(true);

		coerced = result.asCoerced();
		if (typeof coerced === 'number') {
			expect(false).toBe(true);
			return;
		}

		expect(coerced['my_field']).toBe('hello');
		expect(coerced['my_arr']).toEqual(expect.arrayContaining(['debug', 'error', 'info']));
	});

	test('Set', () => {
		const validator = new SetValidator([
			'dog' as const,
			'info' as const,
			1 as const,
			2 as const
		]);

		let result = validator.validate('query', 'dog');
		expect(result.isValid()).toBe(true);

		let coerced = result.asCoerced();
		expect(coerced).toBe('dog');
	});

	test('Array', () => {
		const validator = new ArrayValidator(
			new AnyOfValidator([
				new SetValidator(['dog' as const, 'info' as const, 1 as const, 2 as const]),
				new SchemeValidator({
					dog: new BooleanValidator(),
					name: new StringValidator()
				})
			])
		);

		let result = validator.validate('query', ['dog', 'info', { dog: true, name: 'spike' }]);
		expect(result.isValid()).toBe(true);

		let coerced = result.asCoerced();
		expect(coerced).toEqual(
			expect.arrayContaining([
				'dog',
				'info',
				expect.objectContaining({ dog: true, name: 'spike' })
			])
		);
		const testElem = coerced[2];
		if (testElem === 1 || testElem === 2 || testElem === 'info' || testElem === 'dog') {
			expect(true).toBe(false);
			return;
		}
		expect(testElem['name']).toBe('spike');
		expect(testElem['dog']).toBe(true);

		result = validator.validate('query', ['dog', 'i', { dog: true, name: 'spike' }]);
		expect(result.isValid()).toBe(false);

		result = validator.validate('query', ['dog', 'info']);
		expect(result.isValid()).toBe(true);

		coerced = result.asCoerced();
		expect(coerced[0]).toBe('dog');
	});

	test('Exception', () => {
		const validator = new SchemeValidator({
			id: new NumberValidator({ allowCoercion: true }),
			arg_field: new SetValidator(['dog' as const, 'cat' as const, 1 as const, 2 as const])
		});

		const resultOne = validator.validate('query', { id: '1' });

		// Throws CoercionError. Missing 'arg_field'.
		try {
			const coercedOne = resultOne.asCoerced();
		} catch (e) {
			if (e instanceof CoercionError) {
				console.log(resultOne.errors);
				expect(true).toBe(true);
				return;
			} else {
				throw e;
			}
		}

		expect(true).toBe(false);
	});
});
