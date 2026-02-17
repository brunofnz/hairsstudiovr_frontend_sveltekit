import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { ServiceModel } from '$lib/server/models/service';
import { requireAdmin } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	await connectDB();
	const service = await ServiceModel.findById(params.id).lean();

	if (!service) return json({ success: false, error: 'Servicio no encontrado' }, { status: 404 });

	return json({ success: true, data: service });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	const body = await request.json();
	await connectDB();

	const service = await ServiceModel.findByIdAndUpdate(params.id, body, { new: true }).lean();

	if (!service) return json({ success: false, error: 'Servicio no encontrado' }, { status: 404 });

	return json({ success: true, data: service });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	await connectDB();
	const service = await ServiceModel.findByIdAndDelete(params.id);

	if (!service) return json({ success: false, error: 'Servicio no encontrado' }, { status: 404 });

	return json({ success: true, data: { message: 'Servicio eliminado' } });
};
