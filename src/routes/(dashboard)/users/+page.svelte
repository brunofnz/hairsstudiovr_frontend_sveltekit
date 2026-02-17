<script lang="ts">
	import { invalidateAll } from '$app/navigation';
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
	let search = $state('');

	let form = $state({
		name: '',
		username: '',
		password: '',
		role: 'operador' as 'admin' | 'operador',
		categoryIds: [] as string[],
		isActive: true
	});

	const filtered = $derived(
		search
			? data.users.filter(
					(u) =>
						u.name.toLowerCase().includes(search.toLowerCase()) ||
						u.username.toLowerCase().includes(search.toLowerCase())
				)
			: data.users
	);

	function getCategoryNames(categoryIds: string[]) {
		return categoryIds
			.map((id) => {
				const cat = data.categories.find((c) => c._id === id);
				return cat ? `${cat.emoji} ${cat.name}` : '';
			})
			.filter(Boolean)
			.join(', ');
	}

	function openCreate() {
		form = { name: '', username: '', password: '', role: 'operador', categoryIds: [], isActive: true };
		editing = false;
		editId = '';
		modalOpen = true;
	}

	function openEdit(user: (typeof data.users)[0]) {
		form = {
			name: user.name,
			username: user.username,
			password: '',
			role: user.role as 'admin' | 'operador',
			categoryIds: [...user.categoryIds],
			isActive: user.isActive
		};
		editing = true;
		editId = user._id;
		modalOpen = true;
	}

	function openDelete(id: string) {
		deleteId = id;
		confirmOpen = true;
	}

	function toggleCategory(catId: string) {
		if (form.categoryIds.includes(catId)) {
			form.categoryIds = form.categoryIds.filter((id) => id !== catId);
		} else {
			form.categoryIds = [...form.categoryIds, catId];
		}
	}

	async function handleSave(e: Event) {
		e.preventDefault();
		loading = true;

		try {
			const payload: Record<string, unknown> = {
				name: form.name,
				username: form.username,
				role: form.role,
				categoryIds: form.role === 'operador' ? form.categoryIds : [],
				isActive: form.isActive
			};

			if (form.password) {
				payload.password = form.password;
			}

			if (editing) {
				const res = await api(`/users/${editId}`, {
					method: 'PUT',
					body: JSON.stringify(payload)
				});
				if (res.success) addToast('Usuario actualizado');
				else addToast(res.error || 'Error al actualizar', 'error');
			} else {
				const res = await api('/users', {
					method: 'POST',
					body: JSON.stringify(payload)
				});
				if (res.success) addToast('Usuario creado');
				else addToast(res.error || 'Error al crear', 'error');
			}
			modalOpen = false;
			await invalidateAll();
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		const res = await api(`/users/${deleteId}`, { method: 'DELETE' });
		if (res.success) {
			addToast('Usuario eliminado');
			await invalidateAll();
		} else {
			addToast(res.error || 'Error al eliminar', 'error');
		}
	}
</script>

<svelte:head>
	<title>Usuarios | VR Hair Studio</title>
</svelte:head>

<PageHeader title="Usuarios" description="Gestionar usuarios del sistema">
	{#snippet actions()}
		<Button onclick={openCreate}>+ Nuevo usuario</Button>
	{/snippet}
</PageHeader>

<!-- Search -->
<div class="mb-6">
	<input
		type="text"
		bind:value={search}
		placeholder="Buscar por nombre o usuario..."
		class="w-full max-w-md px-4 py-2.5 rounded-lg border border-blush-medium bg-white
			   focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
			   font-body text-charcoal placeholder:text-gray-dark/50 transition-all duration-200"
	/>
</div>

{#if filtered.length === 0}
	<Card class="p-8 text-center">
		<p class="text-gray-dark font-body">
			{search ? 'No se encontraron usuarios.' : 'No hay usuarios. Creá el primero.'}
		</p>
	</Card>
{:else}
	<!-- Mobile: Card layout -->
	<div class="space-y-3 sm:hidden">
		{#each filtered as user}
			<Card class="p-4">
				<div class="flex items-start justify-between">
					<div class="flex-1 min-w-0">
						<p class="font-body text-charcoal font-medium truncate">{user.name}</p>
						<p class="text-sm text-gray-dark font-body mt-0.5">@{user.username}</p>
						<div class="flex items-center gap-2 mt-2 flex-wrap">
							<span
								class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body
								{user.role === 'admin' ? 'bg-teal/10 text-teal-dark' : 'bg-blush text-gray-dark'}"
							>
								{user.role === 'admin' ? 'Admin' : 'Operador'}
							</span>
							<span
								class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body
								{user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}"
							>
								{user.isActive ? 'Activo' : 'Inactivo'}
							</span>
						</div>
					</div>
					<div class="flex items-center gap-1 ml-3 shrink-0">
						<button
							onclick={() => openEdit(user)}
							class="p-2 text-gray-dark hover:text-teal hover:bg-blush rounded-lg transition-colors cursor-pointer"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
							</svg>
						</button>
						<button
							onclick={() => openDelete(user._id)}
							class="p-2 text-gray-dark hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
							</svg>
						</button>
					</div>
				</div>
			</Card>
		{/each}
	</div>

	<!-- Desktop: Table layout -->
	<Card class="hidden sm:block">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-blush-medium/50 bg-blush/30">
						<th class="text-left px-5 py-3 text-sm font-semibold text-gray-dark font-body">Nombre</th>
						<th class="text-left px-5 py-3 text-sm font-semibold text-gray-dark font-body">Usuario</th>
						<th class="text-left px-5 py-3 text-sm font-semibold text-gray-dark font-body hidden md:table-cell">Rol</th>
						<th class="text-left px-5 py-3 text-sm font-semibold text-gray-dark font-body hidden lg:table-cell">Categorías</th>
						<th class="text-left px-5 py-3 text-sm font-semibold text-gray-dark font-body hidden md:table-cell">Estado</th>
						<th class="text-right px-5 py-3 text-sm font-semibold text-gray-dark font-body">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-blush-medium/30">
					{#each filtered as user}
						<tr class="hover:bg-blush/20 transition-colors">
							<td class="px-5 py-3 font-body text-charcoal font-medium">{user.name}</td>
							<td class="px-5 py-3 font-body text-gray-dark">{user.username}</td>
							<td class="px-5 py-3 hidden md:table-cell">
								<span
									class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body
									{user.role === 'admin' ? 'bg-teal/10 text-teal-dark' : 'bg-blush text-gray-dark'}"
								>
									{user.role === 'admin' ? 'Admin' : 'Operador'}
								</span>
							</td>
							<td class="px-5 py-3 font-body text-gray-dark text-sm hidden lg:table-cell">
								{#if user.role === 'operador' && user.categoryIds.length > 0}
									{getCategoryNames(user.categoryIds)}
								{:else if user.role === 'operador'}
									<span class="text-gray-dark/40">Sin categorías</span>
								{:else}
									<span class="text-gray-dark/40">—</span>
								{/if}
							</td>
							<td class="px-5 py-3 hidden md:table-cell">
								<span
									class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body
									{user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}"
								>
									{user.isActive ? 'Activo' : 'Inactivo'}
								</span>
							</td>
							<td class="px-5 py-3">
								<div class="flex items-center justify-end gap-1">
									<button
										onclick={() => openEdit(user)}
										class="p-1.5 text-gray-dark hover:text-teal hover:bg-blush rounded-lg transition-colors cursor-pointer"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
										</svg>
									</button>
									<button
										onclick={() => openDelete(user._id)}
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
<Modal bind:open={modalOpen} title={editing ? 'Editar usuario' : 'Nuevo usuario'}>
	<form onsubmit={handleSave} class="space-y-4">
		<Input label="Nombre" bind:value={form.name} required placeholder="Nombre completo" />
		<Input label="Usuario" bind:value={form.username} required placeholder="Nombre de usuario" />
		<Input
			label={editing ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
			type="password"
			bind:value={form.password}
			required={!editing}
			placeholder={editing ? 'Nueva contraseña...' : 'Contraseña'}
		/>

		<!-- Role select -->
		<div>
			<label class="block text-sm font-medium text-charcoal font-body mb-1">Rol</label>
			<select
				bind:value={form.role}
				class="w-full px-4 py-2.5 rounded-lg border border-blush-medium bg-white
					   focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
					   font-body text-charcoal transition-all duration-200"
			>
				<option value="operador">Operador</option>
				<option value="admin">Admin</option>
			</select>
		</div>

		<!-- Categories (only for operador) -->
		{#if form.role === 'operador'}
			<div>
				<label class="block text-sm font-medium text-charcoal font-body mb-2"
					>Categorías asignadas</label
				>
				<div class="flex flex-wrap gap-2">
					{#each data.categories as cat}
						<button
							type="button"
							onclick={() => toggleCategory(cat._id)}
							class="px-3 py-1.5 rounded-full text-sm font-body transition-all duration-200 cursor-pointer
								{form.categoryIds.includes(cat._id)
								? 'bg-teal text-white'
								: 'bg-blush/50 text-gray-dark hover:bg-blush'}"
						>
							{cat.emoji} {cat.name}
						</button>
					{/each}
				</div>
				{#if data.categories.length === 0}
					<p class="text-sm text-gray-dark/50 font-body">No hay categorías creadas.</p>
				{/if}
			</div>
		{/if}

		<!-- Active toggle (only when editing) -->
		{#if editing}
			<div class="flex items-center justify-between">
				<label class="text-sm font-medium text-charcoal font-body">Activo</label>
				<button
					type="button"
					onclick={() => (form.isActive = !form.isActive)}
					class="relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer
						{form.isActive ? 'bg-teal' : 'bg-gray-300'}"
				>
					<span
						class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
						{form.isActive ? 'translate-x-5' : 'translate-x-0'}"
					></span>
				</button>
			</div>
		{/if}

		<div class="flex justify-end gap-3 pt-2">
			<Button variant="ghost" onclick={() => (modalOpen = false)}>Cancelar</Button>
			<Button type="submit" {loading}>{editing ? 'Guardar' : 'Crear'}</Button>
		</div>
	</form>
</Modal>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Eliminar usuario"
	message="¿Estás segura de que querés eliminar este usuario? Esta acción no se puede deshacer."
	confirmLabel="Eliminar"
	onConfirm={handleDelete}
/>
