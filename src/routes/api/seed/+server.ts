import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '$env/static/private';
import { connectDB } from '$lib/server/db';
import { UserModel } from '$lib/server/models/user';
import { CategoryModel } from '$lib/server/models/category';
import { ServiceModel } from '$lib/server/models/service';
import { hashPassword } from '$lib/server/auth';

const SEED_DATA = [
	{
		name: 'Peluquería',
		emoji: '✂️',
		description: 'Servicios de corte y tratamiento capilar',
		order: 1,
		services: [
			{ name: 'Lavado', price: 10000 },
			{ name: 'Corte', price: 25000 },
			{ name: 'Hidratación', price: 25000 },
			{ name: 'Botox / Keratina / Cauterizado', price: 30000 },
			{ name: 'Alisado', price: 50000 }
		]
	},
	{
		name: 'Color',
		emoji: '🎨',
		description: 'Servicios de coloración y reflejos',
		order: 2,
		services: [
			{ name: 'Baño de luz', price: 50000 },
			{ name: 'Retoque de raíz', price: 40000 },
			{ name: 'Iluminaciones', price: 120000 },
			{ name: 'Reflejos', price: 70000 }
		]
	},
	{
		name: 'Peinado y Maquillaje',
		emoji: '💄',
		description: 'Servicios de peinado y maquillaje profesional',
		order: 3,
		services: [
			{ name: 'Peinado', price: 35000 },
			{ name: 'Peinado express', price: 25000 },
			{ name: 'Peinado y maquillaje', price: 65000 },
			{ name: 'Maquillaje', price: 35000 },
			{ name: 'Maquillaje express', price: 30000 },
			{ name: 'Peinado y maquillaje express', price: 40000 }
		]
	}
];

export const POST: RequestHandler = async () => {
	await connectDB();

	// Upsert admin user
	const existingAdmin = await UserModel.findOne({ username: ADMIN_USERNAME });
	if (!existingAdmin) {
		const passwordHash = await hashPassword(ADMIN_PASSWORD);
		await UserModel.create({
			username: ADMIN_USERNAME,
			passwordHash,
			name: 'VR Hair Studio',
			role: 'admin'
		});
	}

	// Upsert categories and services
	for (const catData of SEED_DATA) {
		const category = await CategoryModel.findOneAndUpdate(
			{ name: catData.name },
			{ emoji: catData.emoji, description: catData.description, order: catData.order },
			{ upsert: true, new: true }
		);

		for (const svc of catData.services) {
			await ServiceModel.findOneAndUpdate(
				{ categoryId: category._id, name: svc.name },
				{ price: svc.price },
				{ upsert: true, new: true }
			);
		}
	}

	return json({
		success: true,
		data: { message: 'Seed completado: admin + 3 categorías + 15 servicios' }
	});
};
