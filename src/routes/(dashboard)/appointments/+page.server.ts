import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { AppointmentModel } from '$lib/server/models/appointment';
import { ClientModel } from '$lib/server/models/client';

const PER_PAGE = 15;

export const load: PageServerLoad = async ({ url }) => {
	await connectDB();

	const now = new Date();
	const from = url.searchParams.get('from') || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
	const to = url.searchParams.get('to') || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

	const filter = { date: { $gte: new Date(from), $lte: new Date(to) } };

	const [appointments, total, birthdayClients] = await Promise.all([
		AppointmentModel.find(filter)
			.populate('clientIds', 'name phone')
			.sort({ date: 1, time: 1 })
			.skip((page - 1) * PER_PAGE)
			.limit(PER_PAGE)
			.lean(),
		AppointmentModel.countDocuments(filter),
		// Load all clients with birthDate so calendar can show birthdays across month navigation
		ClientModel.find({ birthDate: { $ne: null } })
			.select('name phone birthDate')
			.lean()
	]);

	return {
		appointments: appointments.map((a) => ({
			...a,
			_id: a._id.toString(),
			clientId: undefined,
			clientIds: (a.clientIds as unknown[])?.map((c: unknown) =>
				typeof c === 'object' && c !== null ? (c as Record<string, unknown>)._id?.toString() : String(c)
			) || [],
			clients: (a.clientIds as unknown[])?.map((c: unknown) =>
				typeof c === 'object' && c !== null ? {
					_id: (c as Record<string, unknown>)._id?.toString(),
					name: (c as Record<string, unknown>).name,
					phone: (c as Record<string, unknown>).phone
				} : null
			).filter(Boolean) || [],
			services: (a.services as unknown[])?.map((s: unknown) => {
				const svc = s as Record<string, unknown>;
				return { serviceId: svc.serviceId?.toString() || '', name: svc.name, price: svc.price };
			}) || [],
			date: a.date instanceof Date ? a.date.toISOString() : a.date
		})),
		pagination: { page, totalPages: Math.ceil(total / PER_PAGE), total },
		birthdayClients: birthdayClients.map((c) => ({
			_id: c._id.toString(),
			name: c.name as string,
			phone: c.phone as string,
			birthDate: (c.birthDate instanceof Date ? c.birthDate.toISOString() : c.birthDate) as string,
			birthDay: new Date(c.birthDate!).getUTCDate()
		}))
	};
};
