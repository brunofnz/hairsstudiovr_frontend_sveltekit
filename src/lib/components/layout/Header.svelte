<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';

	let {
		userName = '',
		userRole = 'operador',
		onToggleSidebar
	}: {
		userName?: string;
		userRole?: 'admin' | 'operador';
		onToggleSidebar?: () => void;
	} = $props();

	async function handleLogout() {
		await api('/auth/logout', { method: 'POST' });
		goto('/login');
	}
</script>

<header class="sticky top-0 z-30 bg-white border-b border-blush-medium/50 px-4 sm:px-6 lg:px-8">
	<div class="flex items-center justify-between h-16">
		<!-- Mobile menu button -->
		<button
			onclick={onToggleSidebar}
			class="lg:hidden p-2 rounded-lg text-gray-dark hover:bg-blush transition-colors cursor-pointer"
			aria-label="Abrir menú"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
			</svg>
		</button>

		<div class="flex-1"></div>

		<!-- User info + logout -->
		<div class="flex items-center gap-3">
			<div class="hidden sm:flex items-center gap-2">
				<span class="text-sm text-gray-dark font-body">{userName}</span>
				<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body
					{userRole === 'admin' ? 'bg-teal/10 text-teal-dark' : 'bg-blush text-gray-dark'}">
					{userRole === 'admin' ? 'Admin' : 'Operador'}
				</span>
			</div>
			<button
				onclick={handleLogout}
				class="flex items-center gap-2 px-3 py-2 text-sm text-gray-dark hover:text-charcoal
					   hover:bg-blush rounded-lg transition-colors font-body cursor-pointer"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
				</svg>
				<span class="hidden sm:inline">Salir</span>
			</button>
		</div>
	</div>
</header>
