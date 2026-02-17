import { writable } from 'svelte/store';

type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' };

let nextId = 0;

const toastStore = writable<Toast[]>([]);

export function getToasts(): Toast[] {
	let value: Toast[] = [];
	toastStore.subscribe((v) => (value = v))();
	return value;
}

export const toasts = { subscribe: toastStore.subscribe };

export function addToast(message: string, type: Toast['type'] = 'success') {
	const id = nextId++;
	toastStore.update((t) => [...t, { id, message, type }]);
	setTimeout(() => removeToast(id), 4000);
}

export function removeToast(id: number) {
	toastStore.update((t) => t.filter((toast) => toast.id !== id));
}
