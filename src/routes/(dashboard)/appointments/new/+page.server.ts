import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { CategoryModel } from '$lib/server/models/category';
import { ServiceModel } from '$lib/server/models/service';
import { ClientModel } from '$lib/server/models/client';

export const load: PageServerLoad = async ({ url, locals }) => {
	await connectDB();

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
		categories: categories.map((c) => ({ ...c, _id: c._id.toString() })),
		services: services.map((s) => ({ ...s, _id: s._id.toString(), categoryId: s.categoryId.toString() })),
		clients: clients.map((c) => ({ ...c, _id: c._id.toString() })),
		preselectedClientId: url.searchParams.get('clientId') || ''
	};
};
