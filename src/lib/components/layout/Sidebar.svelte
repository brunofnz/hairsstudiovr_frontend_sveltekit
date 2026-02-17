<script lang="ts">
	import { page } from '$app/stores';

	let {
		open = $bindable(false),
		role = 'operador'
	}: {
		open?: boolean;
		role?: 'admin' | 'operador';
	} = $props();

	const allNavItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ href: '/appointments', label: 'Turnos', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
		{ href: '/clients', label: 'Clientes', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
		{ href: '/services', label: 'Servicios', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', adminOnly: true },
		{ href: '/categories', label: 'Categorías', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', adminOnly: true },
		{ href: '/users', label: 'Usuarios', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', adminOnly: true }
	];

	const navItems = $derived(
		role === 'admin' ? allNavItems : allNavItems.filter((item) => !item.adminOnly)
	);

	function isActive(href: string): boolean {
		return $page.url.pathname.startsWith(href);
	}
</script>

<!-- Mobile overlay -->
{#if open}
	<div
		class="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
		onclick={() => (open = false)}
		onkeydown={(e) => e.key === 'Escape' && (open = false)}
		role="button"
		tabindex="-1"
	></div>
{/if}

<!-- Sidebar -->
<aside
	class="fixed top-0 left-0 z-50 h-full w-64 bg-charcoal text-white
		   transform transition-transform duration-300 ease-in-out
		   lg:translate-x-0
		   {open ? 'translate-x-0' : '-translate-x-full'}"
>
	<!-- Logo -->
	<div class="p-6 border-b border-white/10">
		<h1 class="font-heading text-2xl font-bold tracking-tight">VR</h1>
		<p class="text-xs tracking-[0.2em] text-white/60 font-body uppercase mt-0.5">Hair Studio</p>
	</div>

	<!-- Navigation -->
	<nav class="p-4 space-y-1">
		{#each navItems as item}
			<a
				href={item.href}
				onclick={() => (open = false)}
				class="flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm
					   transition-all duration-200
					   {isActive(item.href)
						? 'bg-teal text-white'
						: 'text-white/70 hover:bg-white/10 hover:text-white'}"
			>
				<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
				</svg>
				{item.label}
			</a>
		{/each}
	</nav>
</aside>
