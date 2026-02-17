import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { ClientModel } from '$lib/server/models/client';
import { requireAuth } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals }) => {
	const err = requireAuth(locals);
	if (err) return err;

	await connectDB();

	const search = url.searchParams.get('search');
	let filter = {};

	if (search) {
		filter = {
			$or: [
				{ name: { $regex: search, $options: 'i' } },
				{ phone: { $regex: search, $options: 'i' } }
			]
		};
	}

	const clients = await ClientModel.find(filter).sort({ name: 1 }).lean();

	return json({ success: true, data: clients });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const err = requireAuth(locals);
	if (err) return err;

	const body = await request.json();
	const { name, phone, email, notes } = body;

	if (!name || !phone) {
		return json({ success: false, error: 'Nombre y teléfono son requeridos' }, { status: 400 });
	}

	await connectDB();

	const existing = await ClientModel.findOne({ phone });
	if (existing) {
		return json({ success: false, error: 'Ya existe un cliente con ese teléfono' }, { status: 409 });
	}

	const client = await ClientModel.create({
		name,
		phone,
		email: email || '',
		notes: notes || ''
	});

	return json({ success: true, data: client }, { status: 201 });
};
