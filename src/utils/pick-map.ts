function hasKey<T>(obj: T, key: any): key is keyof T {
	return typeof (obj as any)[key] !== 'undefined';
}

type ValuesOf<T extends any[]> = T[number];

export function pickMap<T, Key extends Array<any>>(
	obj: T,
	keys: Key
): {
	[key in ValuesOf<Key>]: key extends keyof T ? T[key] : undefined;
} {
	return keys.reduce((m, key) => {
		m[key] = hasKey(obj, key) ? obj[key] : undefined;
		return m;
	}, {} as any);
}
