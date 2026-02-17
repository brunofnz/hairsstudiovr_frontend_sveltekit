import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { CategoryModel } from '$lib/server/models/category';
import { ServiceModel } from '$lib/server/models/service';

export const load: PageServerLoad = async () => {
	await connectDB();

	const categories = await CategoryModel.find().sort({ order: 1 }).lean();
	const serviceCounts = await ServiceModel.aggregate([
		{ $group: { _id: '$categoryId', count: { $sum: 1 } } }
	]);

	const countMap: Record<string, number> = {};
	for (const s of serviceCounts) {
		countMap[s._id.toString()] = s.count;
	}

	return {
		categories: categories.map((c) => ({
			...c,
			_id: c._id.toString(),
			serviceCount: countMap[c._id.toString()] || 0
		}))
	};
};
