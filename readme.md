# Validators

This is a validation library that provides typed objects from unknown objects.

```typescript
const validator = new SchemeValidator({
	id: new NumberValidator({ allowCoercion: true })
});

// allowCoercion in NumberValidator allows the conversion of '1' to 1.
// I.e. String numbers are converted to numbers.
const result = validator.validate('query', { id: '1' });
if (!result.isValid()) {
	return;
}

const coerced = result.asCoerced();

const id: number = coerced.id; // allowed
const anyObject = coerced.info; // type error. 'info' is not a member of coerced.
```

All validators return a result object which has two methods, `isValid` and `asCoerced`. `asCoerced` will throw if `isValid` is false.

## Example

`SchemeValidator` is the validator used for objects. It attempts to validate the input object based on the shape of the validators object given to the constructor.

```typescript
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
	} else {
		throw e;
	}
}

const resultTwo = validator.validate('query', { id: '1', arg_field: 'dog' });
const coercedTwo = result.asCoerced();

// Type of arg_field
const arg_field: 'dog' | 'cat' | 1 | 2 = coercedTwo.arg_field;
```

## Const Inference for Set Validator

Set validator takes an array of items and checks if the input field is exactly one of the values in the array; checked using `===`.

It can be nice if you write `['dog', 'cat', 1, 2]` and the output type is `Array<'dog' | 'cat' | 1 | 2>`. This can be achieved two ways.

Use const on each element.

```typescript
// type is Array<'dog' | 'cat' | 1 | 2>
const validator = new SetValidator(['dog' as const, 'cat' as const, 1 as const, 2 as const]);
```

Alternitively, use const on the entire array if every element in the array should be interpreted as literal const.

```typescript
// type is Array<'dog' | 'cat' | 1 | 2>
const validator = new SetValidator(['dog', 'cat', 1, 2] as const);
```

## Test

Test config generated by _ts-jest_.

```
npx ts-jest config:init
```

Run tests with `npm run test`.
