import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { AppointmentModel } from '$lib/server/models/appointment';
import { ServiceModel } from '$lib/server/models/service';
import { requireAuth } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals }) => {
	const err = requireAuth(locals);
	if (err) return err;

	await connectDB();

	const filter: Record<string, unknown> = {};
	const status = url.searchParams.get('status');
	const from = url.searchParams.get('from');
	const to = url.searchParams.get('to');
	const date = url.searchParams.get('date');

	if (status) filter.status = status;
	if (date) {
		const d = new Date(date);
		const nextDay = new Date(d);
		nextDay.setDate(nextDay.getDate() + 1);
		filter.date = { $gte: d, $lt: nextDay };
	} else if (from || to) {
		filter.date = {};
		if (from) (filter.date as Record<string, Date>).$gte = new Date(from);
		if (to) (filter.date as Record<string, Date>).$lte = new Date(to);
	}

	const appointments = await AppointmentModel.find(filter)
		.populate('clientIds', 'name phone')
		.sort({ date: 1, time: 1 })
		.lean();

	return json({
		success: true,
		data: appointments.map((a) => ({
			...a,
			_id: a._id.toString(),
			clientId: undefined,
			clientIds: (a.clientIds as unknown[])?.map((c: unknown) =>
				typeof c === 'object' && c !== null ? (c as Record<string, unknown>)._id?.toString() : String(c)
			) || [],
			clients: (a.clientIds as unknown[])?.map((c: unknown) =>
				typeof c === 'object' && c !== null ? {
					_id: (c as Record<string, unknown>)._id?.toString(),
					name: (c as Record<string, unknown>).name,
					phone: (c as Record<string, unknown>).phone
				} : null
			).filter(Boolean) || [],
			services: (a.services as unknown[])?.map((s: unknown) => {
				const svc = s as Record<string, unknown>;
				return { serviceId: svc.serviceId?.toString() || '', name: svc.name, price: svc.price };
			}) || [],
			date: a.date instanceof Date ? a.date.toISOString() : a.date
		}))
	});
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const err = requireAuth(locals);
	if (err) return err;

	const body = await request.json();
	const { clientIds, services, date, time, paymentMethod, notes } = body;

	if (!clientIds?.length || !services?.length || !date || !time || !paymentMethod) {
		return json({ success: false, error: 'Faltan campos requeridos' }, { status: 400 });
	}

	await connectDB();

	// Validate operator can only use services from their assigned categories
	if (locals.user!.role === 'operador') {
		const serviceIds = services.map((s: { serviceId: string }) => s.serviceId);
		const dbServices = await ServiceModel.find({ _id: { $in: serviceIds } }).lean();
		const allowedCatIds = locals.user!.categoryIds;
		const unauthorized = dbServices.filter(
			(s) => !allowedCatIds.includes(s.categoryId.toString())
		);
		if (unauthorized.length > 0) {
			return json(
				{ success: false, error: 'No tenés acceso a algunos de los servicios seleccionados' },
				{ status: 403 }
			);
		}
	}

	const totalPrice = services.reduce((sum: number, s: { price: number }) => sum + s.price, 0);

	const appointment = await AppointmentModel.create({
		clientIds,
		services,
		date: new Date(date),
		time,
		totalPrice,
		paymentMethod,
		notes: notes || '',
		status: 'pendiente'
	});

	return json({ success: true, data: appointment }, { status: 201 });
};
