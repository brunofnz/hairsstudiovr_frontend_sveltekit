<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/utils/api';
	import { addToast } from '$lib/stores/toast';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';

	let { data } = $props();

	let modalOpen = $state(false);
	let confirmOpen = $state(false);
	let editing = $state(false);
	let editId = $state('');
	let deleteId = $state('');
	let loading = $state(false);
	let search = $state(data.search || '');
	let searchTimer: ReturnType<typeof setTimeout>;

	let form = $state({ name: '', phone: '', email: '', notes: '' });

	function handleSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			const url = new URL($page.url);
			if (search) {
				url.searchParams.set('q', search);
			} else {
				url.searchParams.delete('q');
			}
			url.searchParams.delete('page');
			goto(url.toString(), { keepFocus: true, noScroll: true });
		}, 300);
	}

	function openCreate() {
		form = { name: '', phone: '', email: '', notes: '' };
		editing = false;
		editId = '';
		modalOpen = true;
	}

	function openEdit(client: typeof data.clients[0]) {
		form = { name: client.name, phone: client.phone, email: client.email, notes: client.notes };
		editing = true;
		editId = client._id;
		modalOpen = true;
	}

	function openDelete(id: string) {
		deleteId = id;
		confirmOpen = true;
	}

	async function handleSave(e: Event) {
		e.preventDefault();
		loading = true;

		try {
			if (editing) {
				const res = await api(`/clients/${editId}`, {
					method: 'PUT',
					body: JSON.stringify(form)
				});
				if (res.success) addToast('Cliente actualizado');
				else addToast(res.error || 'Error al actualizar', 'error');
			} else {
				const res = await api('/clients', {
					method: 'POST',
					body: JSON.stringify(form)
				});
				if (res.success) addToast('Cliente creado');
				else addToast(res.error || 'Error al crear', 'error');
			}
			modalOpen = false;
			await invalidateAll();
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		const res = await api(`/clients/${deleteId}`, { method: 'DELETE' });
		if (res.success) {
			addToast('Cliente eliminado');
			await invalidateAll();
		} else {
			addToast(res.error || 'Error al eliminar', 'error');
		}
	}
</script>

<svelte:head>
	<title>Clientes | VR Hair Studio</title>
</svelte:head>

<PageHeader title="Clientes" description="Gestionar clientes del salón">
	{#snippet actions()}
		<Button onclick={openCreate}>+ Nuevo cliente</Button>
	{/snippet}
</PageHeader>

<!-- Search -->
<div class="mb-6">
	<input
		type="text"
		bind:value={search}
		oninput={handleSearch}
		placeholder="Buscar por nombre o teléfono..."
		class="w-full max-w-md px-4 py-2.5 rounded-lg border border-blush-medium bg-white
			   focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
			   font-body text-charcoal placeholder:text-gray-dark/50 transition-all duration-200"
	/>
</div>

{#if data.clients.length === 0}
	<Card class="p-8 text-center">
		<p class="text-gray-dark font-body">
			{search ? 'No se encontraron clientes.' : 'No hay clientes. Creá el primero.'}
		</p>
	</Card>
{:else}
	<Card>
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-blush-medium/50 bg-blush/30">
						<th class="text-left px-5 py-3 text-sm font-semibold text-gray-dark font-body">Nombre</th>
						<th class="text-left px-5 py-3 text-sm font-semibold text-gray-dark font-body">Teléfono</th>
						<th class="text-left px-5 py-3 text-sm font-semibold text-gray-dark font-body hidden sm:table-cell">Email</th>
						<th class="text-right px-5 py-3 text-sm font-semibold text-gray-dark font-body">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-blush-medium/30">
					{#each data.clients as client}
						<tr class="hover:bg-blush/20 transition-colors">
							<td class="px-5 py-3">
								<a href="/clients/{client._id}" class="font-body text-charcoal font-medium hover:text-teal transition-colors">
									{client.name}
								</a>
							</td>
							<td class="px-5 py-3 font-body text-gray-dark">{client.phone}</td>
							<td class="px-5 py-3 font-body text-gray-dark hidden sm:table-cell">{client.email || '—'}</td>
							<td class="px-5 py-3">
								<div class="flex items-center justify-end gap-1">
									<button
										onclick={() => openEdit(client)}
										class="p-1.5 text-gray-dark hover:text-teal hover:bg-blush rounded-lg transition-colors cursor-pointer"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
										</svg>
									</button>
									<button
										onclick={() => openDelete(client._id)}
										class="p-1.5 text-gray-dark hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
										</svg>
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>

	<Pagination
		currentPage={data.pagination.page}
		totalPages={data.pagination.totalPages}
		total={data.pagination.total}
	/>
{/if}

<!-- Create/Edit Modal -->
<Modal bind:open={modalOpen} title={editing ? 'Editar cliente' : 'Nuevo cliente'}>
	<form onsubmit={handleSave} class="space-y-4">
		<Input label="Nombre" bind:value={form.name} required placeholder="Nombre completo" />
		<Input label="Teléfono" bind:value={form.phone} required placeholder="Ej: 1155551234" />
		<Input label="Email" type="email" bind:value={form.email} placeholder="Opcional" />
		<Input label="Notas" bind:value={form.notes} placeholder="Observaciones..." />

		<div class="flex justify-end gap-3 pt-2">
			<Button variant="ghost" onclick={() => (modalOpen = false)}>Cancelar</Button>
			<Button type="submit" {loading}>{editing ? 'Guardar' : 'Crear'}</Button>
		</div>
	</form>
</Modal>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Eliminar cliente"
	message="¿Estás segura de que querés eliminar este cliente? Se perderán sus datos."
	confirmLabel="Eliminar"
	onConfirm={handleDelete}
/>
