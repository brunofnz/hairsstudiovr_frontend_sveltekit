import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { CategoryModel } from '$lib/server/models/category';
import { ServiceModel } from '$lib/server/models/service';

const PER_PAGE = 20;

export const load: PageServerLoad = async ({ url }) => {
	await connectDB();

	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const categoryFilter = url.searchParams.get('category') || '';

	const categories = await CategoryModel.find().sort({ order: 1 }).lean();

	const serviceFilter: Record<string, unknown> = { isActive: true };
	if (categoryFilter) {
		serviceFilter.categoryId = categoryFilter;
	}

	const [services, total] = await Promise.all([
		ServiceModel.find(serviceFilter)
			.sort({ categoryId: 1, name: 1 })
			.skip((page - 1) * PER_PAGE)
			.limit(PER_PAGE)
			.lean(),
		ServiceModel.countDocuments(serviceFilter)
	]);

	return {
		categories: categories.map((c) => ({ ...c, _id: c._id.toString() })),
		services: services.map((s) => ({
			...s,
			_id: s._id.toString(),
			categoryId: s.categoryId.toString()
		})),
		pagination: { page, totalPages: Math.ceil(total / PER_PAGE), total },
		categoryFilter
	};
};
