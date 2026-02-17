import type { AppointmentStatus, PaymentMethod } from '$lib/types';

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
	pendiente: 'Pendiente',
	confirmado: 'Confirmado',
	completado: 'Completado',
	cancelado: 'Cancelado'
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
	pendiente: 'bg-amber-100 text-amber-800',
	confirmado: 'bg-teal-light text-teal-dark',
	completado: 'bg-green-100 text-green-800',
	cancelado: 'bg-red-100 text-red-800'
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
	efectivo: 'Efectivo',
	transferencia: 'Transferencia',
	tarjeta: 'Tarjeta'
};

export const PAYMENT_METHODS: PaymentMethod[] = ['efectivo', 'transferencia', 'tarjeta'];
export const APPOINTMENT_STATUSES: AppointmentStatus[] = ['pendiente', 'confirmado', 'completado', 'cancelado'];
