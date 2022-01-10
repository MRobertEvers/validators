export function pickMap<T>(obj: T, keys: Array<keyof T>) {
	return keys.reduce((m, key) => {
		m[key] = obj[key];
		return m;
	}, {} as any);
}
