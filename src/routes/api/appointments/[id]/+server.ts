import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { AppointmentModel } from '$lib/server/models/appointment';
import { requireAuth } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, locals }) => {
	const err = requireAuth(locals);
	if (err) return err;

	await connectDB();
	const appointment = await AppointmentModel.findById(params.id)
		.populate('clientIds', 'name phone email')
		.lean();

	if (!appointment) return json({ success: false, error: 'Turno no encontrado' }, { status: 404 });

	return json({
		success: true,
		data: {
			...appointment,
			_id: appointment._id.toString(),
			clientId: undefined,
			clientIds: (appointment.clientIds as unknown[])?.map((c: unknown) =>
				typeof c === 'object' && c !== null ? (c as Record<string, unknown>)._id?.toString() : String(c)
			) || [],
			clients: (appointment.clientIds as unknown[])?.map((c: unknown) =>
				typeof c === 'object' && c !== null ? c : null
			).filter(Boolean) || [],
			services: (appointment.services as unknown[])?.map((s: unknown) => {
				const svc = s as Record<string, unknown>;
				return { serviceId: svc.serviceId?.toString() || '', name: svc.name, price: svc.price };
			}) || [],
			date: appointment.date instanceof Date ? appointment.date.toISOString() : appointment.date
		}
	});
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const err = requireAuth(locals);
	if (err) return err;

	const body = await request.json();

	if (body.services) {
		body.totalPrice = body.services.reduce((sum: number, s: { price: number }) => sum + s.price, 0);
	}

	if (body.date) {
		body.date = new Date(body.date);
	}

	await connectDB();
	const appointment = await AppointmentModel.findByIdAndUpdate(params.id, body, { new: true }).lean();

	if (!appointment) return json({ success: false, error: 'Turno no encontrado' }, { status: 404 });

	return json({ success: true, data: appointment });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const err = requireAuth(locals);
	if (err) return err;

	await connectDB();
	const appointment = await AppointmentModel.findByIdAndDelete(params.id);

	if (!appointment) return json({ success: false, error: 'Turno no encontrado' }, { status: 404 });

	return json({ success: true, data: { message: 'Turno eliminado' } });
};
