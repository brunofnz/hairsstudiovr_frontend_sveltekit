import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { UserModel } from '$lib/server/models/user';
import { hashPassword, requireAdmin } from '$lib/server/auth';

export const GET: RequestHandler = async ({ locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	await connectDB();
	const users = await UserModel.find().sort({ name: 1 }).lean();

	return json({
		success: true,
		data: users.map((u) => ({
			_id: u._id.toString(),
			username: u.username,
			name: u.name,
			role: u.role,
			categoryIds: (u.categoryIds || []).map((id: unknown) => String(id)),
			isActive: u.isActive,
			createdAt: u.createdAt,
			updatedAt: u.updatedAt
		}))
	});
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	const body = await request.json();
	const { username, name, role, categoryIds, password } = body;

	if (!username || !name || !role || !password) {
		return json({ success: false, error: 'Faltan campos requeridos' }, { status: 400 });
	}

	await connectDB();

	const existing = await UserModel.findOne({ username });
	if (existing) {
		return json({ success: false, error: 'El nombre de usuario ya existe' }, { status: 409 });
	}

	const passwordHash = await hashPassword(password);
	const user = await UserModel.create({
		username,
		name,
		role,
		categoryIds: role === 'operador' ? (categoryIds || []) : [],
		passwordHash
	});

	return json({
		success: true,
		data: {
			_id: user._id.toString(),
			username: user.username,
			name: user.name,
			role: user.role,
			categoryIds: (user.categoryIds || []).map((id: unknown) => String(id)),
			isActive: user.isActive
		}
	}, { status: 201 });
};
