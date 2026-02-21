import type { PageServerLoad } from './$types';
import { connectDB } from '$lib/server/db';
import { AppointmentModel } from '$lib/server/models/appointment';
import { ClientModel } from '$lib/server/models/client';
import { ServiceModel } from '$lib/server/models/service';

export const load: PageServerLoad = async () => {
	await connectDB();

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
	const todayMonth = today.getMonth() + 1; // MongoDB $month is 1-based
	const todayDay = today.getDate();

	const [todayCount, totalClients, totalServices, monthlyRevenue, todayAppointments, todayBirthdays, monthBirthdays] =
		await Promise.all([
			AppointmentModel.countDocuments({
				date: { $gte: today, $lt: tomorrow },
				status: { $ne: 'cancelado' }
			}),
			ClientModel.countDocuments(),
			ServiceModel.countDocuments({ isActive: true }),
			AppointmentModel.aggregate([
				{
					$match: {
						date: { $gte: startOfMonth },
						status: 'completado',
						paid: true
					}
				},
				{ $group: { _id: null, total: { $sum: '$totalPrice' } } }
			]),
			AppointmentModel.find({
				date: { $gte: today, $lt: tomorrow },
				status: { $ne: 'cancelado' }
			})
				.populate('clientIds', 'name phone')
				.sort({ time: 1 })
				.lean(),
			// Today's birthdays
			ClientModel.find({
				birthDate: { $ne: null },
				$expr: {
					$and: [
						{ $eq: [{ $month: '$birthDate' }, todayMonth] },
						{ $eq: [{ $dayOfMonth: '$birthDate' }, todayDay] }
					]
				}
			}).select('name phone birthDate').lean(),
			// This month's birthdays (excluding today)
			ClientModel.find({
				birthDate: { $ne: null },
				$expr: {
					$and: [
						{ $eq: [{ $month: '$birthDate' }, todayMonth] },
						{ $ne: [{ $dayOfMonth: '$birthDate' }, todayDay] }
					]
				}
			}).select('name phone birthDate').lean()
		]);

	// Sort month birthdays by upcoming day
	const sortedMonthBirthdays = [...monthBirthdays].sort((a, b) => {
		const dayA = new Date(a.birthDate!).getUTCDate();
		const dayB = new Date(b.birthDate!).getUTCDate();
		return dayA - dayB;
	});

	return {
		stats: {
			todayCount,
			totalClients,
			totalServices,
			monthlyRevenue: monthlyRevenue[0]?.total || 0
		},
		todayBirthdays: todayBirthdays.map((c) => ({
			_id: c._id.toString(),
			name: c.name as string,
			phone: c.phone as string,
			birthDate: (c.birthDate instanceof Date ? c.birthDate.toISOString() : c.birthDate) as string,
			birthDay: new Date(c.birthDate!).getUTCDate()
		})),
		monthBirthdays: sortedMonthBirthdays.map((c) => ({
			_id: c._id.toString(),
			name: c.name as string,
			phone: c.phone as string,
			birthDate: (c.birthDate instanceof Date ? c.birthDate.toISOString() : c.birthDate) as string,
			birthDay: new Date(c.birthDate!).getUTCDate()
		})),
		todayAppointments: todayAppointments.map((a) => ({
			...a,
			_id: a._id.toString(),
			clientId: undefined,
			clientIds: (a.clientIds as unknown[])?.map((c: unknown) =>
				typeof c === 'object' && c !== null ? (c as Record<string, unknown>)._id?.toString() : String(c)
			) || [],
			clients: (a.clientIds as unknown[])?.map((c: unknown) =>
				typeof c === 'object' && c !== null ? {
					name: (c as Record<string, unknown>).name,
					phone: (c as Record<string, unknown>).phone
				} : null
			).filter(Boolean) || [],
			services: (a.services as unknown[])?.map((s: unknown) => {
				const svc = s as Record<string, unknown>;
				return { serviceId: svc.serviceId?.toString() || '', name: svc.name, price: svc.price };
			}) || [],
			date: a.date instanceof Date ? a.date.toISOString() : a.date
		}))
	};
};
