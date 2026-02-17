<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await api('/auth/login', {
				method: 'POST',
				body: JSON.stringify({ username, password })
			});

			if (res.success) {
				goto('/dashboard');
			} else {
				error = res.error || 'Error al iniciar sesión';
			}
		} catch {
			error = 'Error de conexión';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login | VR Hair Studio</title>
</svelte:head>

<div class="min-h-screen bg-blush flex items-center justify-center px-4">
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="text-center mb-8">
			<h1 class="font-heading text-5xl font-bold text-charcoal tracking-tight">VR</h1>
			<p class="text-sm tracking-[0.3em] text-gray-dark mt-1 font-body uppercase">Hair Studio</p>
			<div class="w-16 h-0.5 bg-teal mx-auto mt-3"></div>
		</div>

		<!-- Form Card -->
		<div class="bg-white rounded-2xl shadow-lg p-8">
			<h2 class="font-heading text-2xl font-bold text-charcoal text-center mb-6">
				Iniciar sesión
			</h2>

			{#if error}
				<div class="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 font-body">
					{error}
				</div>
			{/if}

			<form onsubmit={handleLogin} class="space-y-4">
				<div>
					<label for="username" class="block text-sm font-medium text-gray-dark mb-1 font-body">
						Usuario
					</label>
					<input
						id="username"
						type="text"
						bind:value={username}
						required
						class="w-full px-4 py-3 rounded-lg border border-blush-medium bg-blush/30
							   focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
							   font-body text-charcoal placeholder:text-gray-dark/50
							   transition-all duration-200"
						placeholder="admin"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-dark mb-1 font-body">
						Contraseña
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						class="w-full px-4 py-3 rounded-lg border border-blush-medium bg-blush/30
							   focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
							   font-body text-charcoal placeholder:text-gray-dark/50
							   transition-all duration-200"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full py-3 px-4 bg-teal text-white font-body font-semibold rounded-lg
						   hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2
						   disabled:opacity-50 disabled:cursor-not-allowed
						   transition-all duration-200 cursor-pointer"
				>
					{#if loading}
						<span class="inline-flex items-center gap-2">
							<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Ingresando...
						</span>
					{:else}
						Ingresar
					{/if}
				</button>
			</form>
		</div>

		<p class="text-center text-gray-dark/50 text-xs mt-6 font-body">
			VR Hair Studio — Makeup & Hairdressing
		</p>
	</div>
</div>
