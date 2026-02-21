import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { ClientModel } from '$lib/server/models/client';
import { requireAuth } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, locals }) => {
	const err = requireAuth(locals);
	if (err) return err;

	await connectDB();
	const client = await ClientModel.findById(params.id).lean();

	if (!client) return json({ success: false, error: 'Cliente no encontrado' }, { status: 404 });

	return json({ success: true, data: client });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const err = requireAuth(locals);
	if (err) return err;

	const body = await request.json();
	if (body.birthDate !== undefined) {
		body.birthDate = body.birthDate ? new Date(body.birthDate) : null;
	}
	await connectDB();

	const client = await ClientModel.findByIdAndUpdate(params.id, body, { new: true }).lean();

	if (!client) return json({ success: false, error: 'Cliente no encontrado' }, { status: 404 });

	return json({ success: true, data: client });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const err = requireAuth(locals);
	if (err) return err;

	await connectDB();
	const client = await ClientModel.findByIdAndDelete(params.id);

	if (!client) return json({ success: false, error: 'Cliente no encontrado' }, { status: 404 });

	return json({ success: true, data: { message: 'Cliente eliminado' } });
};
