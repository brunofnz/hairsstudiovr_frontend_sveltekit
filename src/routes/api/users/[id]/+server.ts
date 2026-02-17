import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { UserModel } from '$lib/server/models/user';
import { requireAdmin, hashPassword } from '$lib/server/auth';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	const body = await request.json();

	if (body.role === 'admin') {
		body.categoryIds = [];
	}

	// If password provided, hash it
	if (body.password) {
		body.passwordHash = await hashPassword(body.password);
		delete body.password;
	}

	await connectDB();

	if (body.username) {
		const existing = await UserModel.findOne({ username: body.username, _id: { $ne: params.id } });
		if (existing) {
			return json({ success: false, error: 'El nombre de usuario ya existe' }, { status: 409 });
		}
	}

	const user = await UserModel.findByIdAndUpdate(params.id, body, { new: true }).lean();

	if (!user) return json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });

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
	});
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const err = requireAdmin(locals);
	if (err) return err;

	if (locals.user?.id === params.id) {
		return json({ success: false, error: 'No podés eliminarte a vos mismo' }, { status: 400 });
	}

	await connectDB();
	const user = await UserModel.findByIdAndDelete(params.id);

	if (!user) return json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });

	return json({ success: true, data: { message: 'Usuario eliminado' } });
};
