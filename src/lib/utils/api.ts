import type { ApiResponse } from '$lib/types';

export async function api<T>(
	endpoint: string,
	options?: RequestInit
): Promise<ApiResponse<T>> {
	const res = await fetch(`/api${endpoint}`, {
		headers: { 'Content-Type': 'application/json' },
		...options
	});
	return res.json();
}
