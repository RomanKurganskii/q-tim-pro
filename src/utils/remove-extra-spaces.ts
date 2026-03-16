export function removeExtraSpaces(str: string, caseType?: 'UP' | 'LOWER' | null): string {
	if (!str?.length) {
		return str;
	}
	const result = str.replace(/ {2,}/g, ' ').trim();
	return caseType === 'UP'
		? result.toUpperCase()
		: caseType === 'LOWER'
			? result.toLowerCase()
			: result;
}
