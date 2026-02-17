<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import LoadingBar from '$lib/components/ui/LoadingBar.svelte';

	let { data, children } = $props();

	let sidebarOpen = $state(false);
</script>

<LoadingBar />

<div class="min-h-screen bg-blush/30">
	<Sidebar bind:open={sidebarOpen} role={data.user?.role || 'operador'} />

	<div class="lg:ml-64 transition-all duration-300">
		<Header
			userName={data.user?.name || ''}
			userRole={data.user?.role || 'operador'}
			onToggleSidebar={() => (sidebarOpen = !sidebarOpen)}
		/>

		<main class="p-4 sm:p-6 lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
