export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'ARS',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}

export function formatDate(date: string | Date): string {
	return new Intl.DateTimeFormat('es-AR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(new Date(date));
}

export function formatTime(time: string): string {
	return time;
}

export function formatDateTime(date: string | Date, time: string): string {
	return `${formatDate(date)} ${time}`;
}

export function formatBirthday(date: string | Date): string {
	return new Intl.DateTimeFormat('es-AR', {
		day: 'numeric',
		month: 'long',
		timeZone: 'UTC'
	}).format(new Date(date));
}

export function calculateAge(birthDate: string | Date, referenceDate?: Date): number {
	const bd = new Date(birthDate);
	const ref = referenceDate || new Date();
	return ref.getFullYear() - bd.getUTCFullYear();
}
