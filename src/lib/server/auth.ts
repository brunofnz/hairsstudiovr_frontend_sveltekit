import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import { UserModel } from './models/user';
import { SessionModel } from './models/session';

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
	await connectDB();
	const sessionId = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	await SessionModel.create({ sessionId, userId, expiresAt });
	return sessionId;
}

export async function validateSession(
	sessionId: string
): Promise<{ id: string; name: string; role: 'admin' | 'operador'; categoryIds: string[] } | null> {
	await connectDB();
	const session = await SessionModel.findOne({
		sessionId,
		expiresAt: { $gt: new Date() }
	});

	if (!session) return null;

	const user = await UserModel.findById(session.userId);
	if (!user || !user.isActive) return null;

	return {
		id: user._id.toString(),
		name: user.name,
		role: user.role as 'admin' | 'operador',
		categoryIds: (user.categoryIds || []).map((id: unknown) => String(id))
	};
}

export async function deleteSession(sessionId: string): Promise<void> {
	await connectDB();
	await SessionModel.deleteOne({ sessionId });
}

export function requireAuth(locals: App.Locals) {
	if (!locals.user) {
		return json({ success: false, error: 'No autenticado' }, { status: 401 });
	}
	return null;
}

export function requireAdmin(locals: App.Locals) {
	if (!locals.user) {
		return json({ success: false, error: 'No autenticado' }, { status: 401 });
	}
	if (locals.user.role !== 'admin') {
		return json({ success: false, error: 'No autorizado' }, { status: 403 });
	}
	return null;
}
