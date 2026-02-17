export type UserRole = 'admin' | 'operador';

export interface User {
	_id: string;
	username: string;
	name: string;
	role: UserRole;
	categoryIds: string[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Category {
	_id: string;
	name: string;
	description: string;
	emoji: string;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface Service {
	_id: string;
	categoryId: string;
	name: string;
	price: number;
	description: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Client {
	_id: string;
	name: string;
	phone: string;
	email: string;
	notes: string;
	createdAt: string;
	updatedAt: string;
}

export interface AppointmentService {
	serviceId: string;
	name: string;
	price: number;
}

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta';
export type AppointmentStatus = 'pendiente' | 'confirmado' | 'completado' | 'cancelado';

export interface Appointment {
	_id: string;
	clientIds: string[];
	clients?: Client[];
	services: AppointmentService[];
	date: string;
	time: string;
	totalPrice: number;
	paymentMethod: PaymentMethod;
	status: AppointmentStatus;
	paid: boolean;
	notes: string;
	createdAt: string;
	updatedAt: string;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
}
