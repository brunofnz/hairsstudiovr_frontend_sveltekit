import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { UserModel } from '$lib/server/models/user';
import { verifyPassword, createSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { username, password } = await request.json();

	if (!username || !password) {
		return json({ success: false, error: 'Usuario y contraseña requeridos' }, { status: 400 });
	}

	await connectDB();
	const user = await UserModel.findOne({ username });

	if (!user || !user.isActive) {
		return json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
	}

	const valid = await verifyPassword(password, user.passwordHash);

	if (!valid) {
		return json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
	}

	const sessionId = await createSession(user._id.toString());

	cookies.set('session_id', sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false,
		maxAge: 7 * 24 * 60 * 60
	});

	return json({ success: true, data: { name: user.name, role: user.role } });
};
