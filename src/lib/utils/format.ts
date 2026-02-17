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
		year: 'numeric'
	}).format(new Date(date));
}

export function formatTime(time: string): string {
	return time;
}

export function formatDateTime(date: string | Date, time: string): string {
	return `${formatDate(date)} ${time}`;
}
