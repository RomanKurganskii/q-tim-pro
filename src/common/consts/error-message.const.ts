function formatUnknown(value: unknown): string {
	if (value === null || value === undefined) {
		return `${value}`;
	}
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'number' || typeof value === 'boolean') {
		return value.toString();
	}
	return JSON.stringify(value);
}

export const ENTITY_EXCEPTION_TEXT = (
	entityName: string,
	reasons: Array<[string, unknown]>,
	existsFlag: boolean,
) => {
	const reasonsText = reasons
		.map(([field, value]) => `${field} - ${formatUnknown(value)}`)
		.join(', ');
	return `${entityName} с ${reasonsText} ${existsFlag ? 'уже существует' : 'не найден'}`;
};
