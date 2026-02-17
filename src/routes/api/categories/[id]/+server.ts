import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { CategoryModel } from '$lib/server/models/category';
import { ServiceModel } from '$lib/server/models/service';
import { requireAdmin } from '$lib/server/auth';

export const GET: RequestHandler = async ({ params, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	await connectDB();
	const category = await CategoryModel.findById(params.id).lean();

	if (!category) return json({ success: false, error: 'Categoría no encontrada' }, { status: 404 });

	return json({ success: true, data: category });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	const body = await request.json();
	await connectDB();

	const category = await CategoryModel.findByIdAndUpdate(params.id, body, { new: true }).lean();

	if (!category) return json({ success: false, error: 'Categoría no encontrada' }, { status: 404 });

	return json({ success: true, data: category });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	await connectDB();

	const serviceCount = await ServiceModel.countDocuments({ categoryId: params.id });
	if (serviceCount > 0) {
		return json(
			{ success: false, error: `No se puede eliminar: tiene ${serviceCount} servicio(s) asociado(s)` },
			{ status: 400 }
		);
	}

	const category = await CategoryModel.findByIdAndDelete(params.id);

	if (!category) return json({ success: false, error: 'Categoría no encontrada' }, { status: 404 });

	return json({ success: true, data: { message: 'Categoría eliminada' } });
};
