import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { AppointmentModel } from '$lib/server/models/appointment';
import { CategoryModel } from '$lib/server/models/category';
import { ServiceModel } from '$lib/server/models/service';
import { ClientModel } from '$lib/server/models/client';

export const load: PageServerLoad = async ({ params, locals }) => {
	await connectDB();

	const appointment = await AppointmentModel.findById(params.id)
		.populate('clientIds', 'name phone email')
		.lean();

	if (!appointment) throw error(404, 'Turno no encontrado');

	const isOperador = locals.user?.role === 'operador';
	const allowedCatIds = locals.user?.categoryIds || [];

	const categoryFilter = isOperador ? { _id: { $in: allowedCatIds } } : {};
	const serviceFilter = isOperador
		? { isActive: true, categoryId: { $in: allowedCatIds } }
		: { isActive: true };

	const [categories, services, clients] = await Promise.all([
		CategoryModel.find(categoryFilter).sort({ order: 1 }).lean(),
		ServiceModel.find(serviceFilter).sort({ name: 1 }).lean(),
		ClientModel.find().sort({ name: 1 }).lean()
	]);

	return {
		appointment: {
			...appointment,
			_id: appointment._id.toString(),
			clientId: undefined,
			clientIds: (appointment.clientIds as unknown[])?.map((c: unknown) =>
				typeof c === 'object' && c !== null ? (c as Record<string, unknown>)._id?.toString() : String(c)
			) || [],
			services: (appointment.services as unknown[])?.map((s: unknown) => {
				const svc = s as Record<string, unknown>;
				return { serviceId: svc.serviceId?.toString() || '', name: svc.name, price: svc.price };
			}) || [],
			date: appointment.date instanceof Date
				? appointment.date.toISOString().split('T')[0]
				: String(appointment.date).split('T')[0]
		},
		categories: categories.map((c) => ({ ...c, _id: c._id.toString() })),
		services: services.map((s) => ({ ...s, _id: s._id.toString(), categoryId: s.categoryId.toString() })),
		clients: clients.map((c) => ({ ...c, _id: c._id.toString() }))
	};
};
