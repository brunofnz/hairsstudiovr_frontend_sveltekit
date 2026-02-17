import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session_id');

	if (sessionId) {
		const user = await validateSession(sessionId);
		event.locals.user = user;
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
