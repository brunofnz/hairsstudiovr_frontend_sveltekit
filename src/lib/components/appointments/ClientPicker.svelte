<script lang="ts">
	import type { Client } from '$lib/types';
	import { api } from '$lib/utils/api';
	import { addToast } from '$lib/stores/toast';

	let {
		clients = $bindable<Client[]>([]),
		selected = $bindable<string[]>([])
	}: {
		clients?: Client[];
		selected?: string[];
	} = $props();

	let search = $state('');
	let open = $state(false);
	let showNewForm = $state(false);
	let newName = $state('');
	let newPhone = $state('');
	let newEmail = $state('');
	let creating = $state(false);

	const filtered = $derived(() => {
		if (!search) return clients.filter((c) => !selected.includes(c._id));
		const q = search.toLowerCase();
		return clients.filter(
			(c) =>
				!selected.includes(c._id) &&
				(c.name.toLowerCase().includes(q) || c.phone.includes(q))
		);
	});

	const selectedClients = $derived(
		selected.map((id) => clients.find((c) => c._id === id)).filter(Boolean) as Client[]
	);

	function addClient(client: Client) {
		selected = [...selected, client._id];
		search = '';
		open = false;
		showNewForm = false;
	}

	function removeClient(id: string) {
		selected = selected.filter((s) => s !== id);
	}

	function openNewForm() {
		newName = search;
		newPhone = '';
		showNewForm = true;
	}

	function cancelNewForm() {
		showNewForm = false;
		newName = '';
		newPhone = '';
		newEmail = '';
	}

	async function handleCreateClient(e: Event) {
		e.preventDefault();
		e.stopPropagation();

		if (!newName.trim() || !newPhone.trim()) {
			addToast('Nombre y teléfono son requeridos', 'error');
			return;
		}

		creating = true;
		try {
			const res = await api('/clients', {
				method: 'POST',
				body: JSON.stringify({ name: newName.trim(), phone: newPhone.trim(), email: newEmail.trim(), notes: '' })
			});

			if (res.success && res.data) {
				const newClient: Client = {
					_id: res.data._id,
					name: res.data.name,
					phone: res.data.phone,
					email: res.data.email || '',
					notes: res.data.notes || '',
					birthDate: res.data.birthDate || null,
					createdAt: res.data.createdAt || '',
					updatedAt: res.data.updatedAt || ''
				};
				clients = [...clients, newClient];
				addClient(newClient);
				addToast(`Cliente "${newClient.name}" creado`);
				newName = '';
				newPhone = '';
				newEmail = '';
			} else {
				addToast(res.error || 'Error al crear cliente', 'error');
			}
		} finally {
			creating = false;
		}
	}
</script>

<div class="space-y-2">
	<label class="block text-sm font-medium text-gray-dark font-body">
		Cliente{selected.length > 1 ? 's' : ''} <span class="text-red-500">*</span>
	</label>

	<!-- Selected clients -->
	{#if selectedClients.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each selectedClients as client}
				<span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal/10 border border-teal/20 text-sm font-body text-charcoal">
					<span class="font-medium">{client.name}</span>
					<span class="text-gray-dark text-xs">{client.phone}</span>
					<button
						type="button"
						onclick={() => removeClient(client._id)}
						class="ml-1 text-gray-dark hover:text-red-500 cursor-pointer transition-colors"
					>
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</span>
			{/each}
		</div>
	{/if}

	<!-- Search input -->
	<div class="relative">
		<input
			type="text"
			bind:value={search}
			onfocus={() => (open = true)}
			placeholder={selected.length > 0 ? 'Agregar otro cliente...' : 'Buscar cliente por nombre o teléfono...'}
			class="w-full px-4 py-2.5 rounded-lg border border-blush-medium bg-blush/30
				   focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
				   font-body text-charcoal placeholder:text-gray-dark/50 transition-all duration-200"
		/>

		<!-- Dropdown -->
		{#if open}
			<div class="absolute z-20 w-full mt-1 bg-white border border-blush-medium rounded-lg shadow-lg max-h-64 overflow-y-auto">
				{#if !showNewForm}
					{#each filtered() as client}
						<button
							type="button"
							onclick={() => addClient(client)}
							class="w-full text-left px-4 py-2.5 hover:bg-blush/40 transition-colors cursor-pointer
								   font-body text-sm flex items-center justify-between"
						>
							<span class="text-charcoal font-medium">{client.name}</span>
							<span class="text-gray-dark text-xs">{client.phone}</span>
						</button>
					{:else}
						<div class="px-4 py-3 text-sm text-gray-dark font-body text-center">
							{search ? 'No se encontraron clientes' : 'No hay más clientes disponibles'}
						</div>
					{/each}

					<!-- New client button -->
					<button
						type="button"
						onclick={openNewForm}
						class="w-full text-left px-4 py-2.5 border-t border-blush-medium/50
							   hover:bg-teal/5 transition-colors cursor-pointer
							   font-body text-sm flex items-center gap-2 text-teal-dark font-medium"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
						Crear cliente nuevo
					</button>
				{:else}
					<!-- Inline create form -->
					<div class="p-4">
						<div class="flex items-center gap-2 mb-3">
							<svg class="w-4 h-4 text-teal-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
							</svg>
							<span class="font-body text-sm font-semibold text-charcoal">Nuevo cliente</span>
						</div>
						<form onsubmit={handleCreateClient} class="space-y-3">
							<input
								type="text"
								bind:value={newName}
								placeholder="Nombre completo"
								required
								class="w-full px-3 py-2 rounded-lg border border-blush-medium bg-blush/20
									   focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
									   font-body text-sm text-charcoal placeholder:text-gray-dark/50"
							/>
							<input
								type="text"
								bind:value={newPhone}
								placeholder="Teléfono (ej: 1155551234)"
								required
								class="w-full px-3 py-2 rounded-lg border border-blush-medium bg-blush/20
									   focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
									   font-body text-sm text-charcoal placeholder:text-gray-dark/50"
							/>
							<input
								type="email"
								bind:value={newEmail}
								placeholder="Email (opcional)"
								class="w-full px-3 py-2 rounded-lg border border-blush-medium bg-blush/20
									   focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
									   font-body text-sm text-charcoal placeholder:text-gray-dark/50"
							/>
							<div class="flex justify-end gap-2">
								<button
									type="button"
									onclick={cancelNewForm}
									class="px-3 py-1.5 text-sm font-body text-gray-dark hover:text-charcoal
										   rounded-lg hover:bg-blush/40 transition-colors cursor-pointer"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={creating}
									class="px-3 py-1.5 text-sm font-body font-medium text-white
										   bg-teal hover:bg-teal-dark rounded-lg transition-colors cursor-pointer
										   disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{creating ? 'Creando...' : 'Crear y agregar'}
								</button>
							</div>
						</form>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Click outside to close -->
	{#if open}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-10"
			onclick={() => { open = false; showNewForm = false; }}
			onkeydown={() => {}}
		></div>
	{/if}
</div>
