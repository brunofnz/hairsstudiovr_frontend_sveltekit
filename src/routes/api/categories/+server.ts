import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { CategoryModel } from '$lib/server/models/category';
import { requireAdmin } from '$lib/server/auth';

export const GET: RequestHandler = async ({ locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	await connectDB();
	const categories = await CategoryModel.find().sort({ order: 1 }).lean();

	return json({ success: true, data: categories });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	const body = await request.json();
	const { name, description, emoji, order } = body;

	if (!name) return json({ success: false, error: 'Nombre requerido' }, { status: 400 });

	await connectDB();
	const category = await CategoryModel.create({
		name,
		description: description || '',
		emoji: emoji || '',
		order: order ?? 0
	});

	return json({ success: true, data: category }, { status: 201 });
};
