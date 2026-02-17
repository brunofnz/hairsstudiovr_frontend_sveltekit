import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectDB } from '$lib/server/db';
import { AppointmentModel } from '$lib/server/models/appointment';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) return json({ success: false, error: 'No autenticado' }, { status: 401 });

	await connectDB();
	const appointments = await AppointmentModel.find({ clientIds: params.id })
		.sort({ date: -1, time: -1 })
		.lean();

	return json({ success: true, data: appointments });
};
