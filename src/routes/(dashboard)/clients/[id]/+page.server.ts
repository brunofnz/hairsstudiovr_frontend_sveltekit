import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { ClientModel } from '$lib/server/models/client';
import { AppointmentModel } from '$lib/server/models/appointment';

export const load: PageServerLoad = async ({ params }) => {
	await connectDB();

	const client = await ClientModel.findById(params.id).lean();
	if (!client) throw error(404, 'Cliente no encontrado');

	const appointments = await AppointmentModel.find({ clientIds: params.id })
		.sort({ date: -1, time: -1 })
		.lean();

	return {
		client: {
			...client,
			_id: client._id.toString(),
			birthDate: client.birthDate instanceof Date ? client.birthDate.toISOString() : (client.birthDate || null)
		},
		appointments: appointments.map((a) => ({
			...a,
			_id: a._id.toString(),
			clientId: undefined,
			clientIds: (a.clientIds as unknown[])?.map((c: unknown) => String(c)) || [],
			services: (a.services as unknown[])?.map((s: unknown) => {
				const svc = s as Record<string, unknown>;
				return { serviceId: svc.serviceId?.toString() || '', name: svc.name, price: svc.price };
			}) || [],
			date: a.date.toISOString()
		}))
	};
};
