import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { UserModel } from '$lib/server/models/user';
import { CategoryModel } from '$lib/server/models/category';

const PER_PAGE = 20;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		throw redirect(303, '/dashboard');
	}

	await connectDB();

	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

	const [users, total, categories] = await Promise.all([
		UserModel.find()
			.sort({ name: 1 })
			.skip((page - 1) * PER_PAGE)
			.limit(PER_PAGE)
			.lean(),
		UserModel.countDocuments(),
		CategoryModel.find().sort({ order: 1 }).lean()
	]);

	return {
		users: users.map((u) => ({
			_id: u._id.toString(),
			username: u.username,
			name: u.name,
			role: u.role,
			categoryIds: (u.categoryIds || []).map((id: unknown) => String(id)),
			isActive: u.isActive ?? true
		})),
		categories: categories.map((c) => ({
			_id: c._id.toString(),
			name: c.name,
			emoji: c.emoji
		})),
		pagination: { page, totalPages: Math.ceil(total / PER_PAGE), total }
	};
};
