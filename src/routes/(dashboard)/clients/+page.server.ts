import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { ClientModel } from '$lib/server/models/client';

const PER_PAGE = 20;

export const load: PageServerLoad = async ({ url }) => {
	await connectDB();

	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const search = url.searchParams.get('q') || '';

	const filter: Record<string, unknown> = {};
	if (search) {
		filter.$or = [
			{ name: { $regex: search, $options: 'i' } },
			{ phone: { $regex: search, $options: 'i' } }
		];
	}

	const [clients, total] = await Promise.all([
		ClientModel.find(filter)
			.sort({ name: 1 })
			.skip((page - 1) * PER_PAGE)
			.limit(PER_PAGE)
			.lean(),
		ClientModel.countDocuments(filter)
	]);

	return {
		clients: clients.map((c) => ({
			...c,
			_id: c._id.toString()
		})),
		pagination: { page, totalPages: Math.ceil(total / PER_PAGE), total },
		search
	};
};
