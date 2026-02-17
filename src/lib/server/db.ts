import mongoose from 'mongoose';
import { MONGODB_URI } from '$env/static/private';

interface Cached {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & { __mongoose?: Cached };

let cached: Cached = globalWithMongoose.__mongoose || { conn: null, promise: null };

if (!globalWithMongoose.__mongoose) {
	globalWithMongoose.__mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
	if (cached.conn) return cached.conn;

	if (!cached.promise) {
		cached.promise = mongoose.connect(MONGODB_URI);
	}

	cached.conn = await cached.promise;
	return cached.conn;
}
