import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { ServiceModel } from '$lib/server/models/service';
import { requireAdmin } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	await connectDB();

	const categoryId = url.searchParams.get('categoryId');
	const filter: Record<string, unknown> = {};

	if (categoryId) filter.categoryId = categoryId;

	const services = await ServiceModel.find(filter).sort({ name: 1 }).lean();

	return json({ success: true, data: services });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	const body = await request.json();
	const { categoryId, name, price, description } = body;

	if (!categoryId || !name || price == null) {
		return json({ success: false, error: 'Categoría, nombre y precio son requeridos' }, { status: 400 });
	}

	await connectDB();
	const service = await ServiceModel.create({
		categoryId,
		name,
		price,
		description: description || ''
	});

	return json({ success: true, data: service }, { status: 201 });
};
