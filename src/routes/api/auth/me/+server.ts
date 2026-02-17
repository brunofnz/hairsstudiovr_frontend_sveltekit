import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ success: false, error: 'No autenticado' }, { status: 401 });
	}

	return json({ success: true, data: locals.user });
};
