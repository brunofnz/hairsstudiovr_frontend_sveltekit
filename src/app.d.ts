declare global {
	namespace App {
		interface Locals {
			user: { id: string; name: string; role: 'admin' | 'operador'; categoryIds: string[] } | null;
		}
	}
}

export {};
