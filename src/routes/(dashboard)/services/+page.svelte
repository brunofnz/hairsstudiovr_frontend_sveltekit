<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/utils/api';
	import { addToast } from '$lib/stores/toast';
	import { formatCurrency } from '$lib/utils/format';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';

	let { data } = $props();

	let modalOpen = $state(false);
	let confirmOpen = $state(false);
	let editing = $state(false);
	let editId = $state('');
	let deleteId = $state('');
	let loading = $state(false);

	let form = $state({ categoryId: '', name: '', price: '', description: '' });

	const categoryOptions = $derived(
		data.categories.map((c) => ({ value: c._id, label: `${c.emoji} ${c.name}` }))
	);

	const servicesByCategory = $derived(() => {
		const map = new Map<string, typeof data.services>();
		for (const cat of data.categories) {
			map.set(cat._id, data.services.filter((s) => s.categoryId === cat._id));
		}
		return map;
	});

	// Categories shown in the current page (filtered or all)
	const visibleCategories = $derived(
		data.categoryFilter
			? data.categories.filter((c) => c._id === data.categoryFilter)
			: data.categories
	);

	function filterByCategory(catId: string) {
		const url = new URL($page.url);
		if (catId) {
			url.searchParams.set('category', catId);
		} else {
			url.searchParams.delete('category');
		}
		url.searchParams.delete('page');
		goto(url.toString(), { keepFocus: true, noScroll: true });
	}

	function openCreate() {
		form = { categoryId: data.categoryFilter || '', name: '', price: '', description: '' };
		editing = false;
		editId = '';
		modalOpen = true;
	}

	function openEdit(svc: typeof data.services[0]) {
		form = {
			categoryId: svc.categoryId,
			name: svc.name,
			price: String(svc.price),
			description: svc.description || ''
		};
		editing = true;
		editId = svc._id;
		modalOpen = true;
	}

	function openDelete(id: string) {
		deleteId = id;
		confirmOpen = true;
	}

	async function handleSave(e: Event) {
		e.preventDefault();
		loading = true;

		const payload = { ...form, price: Number(form.price) };

		try {
			if (editing) {
				const res = await api(`/services/${editId}`, {
					method: 'PUT',
					body: JSON.stringify(payload)
				});
				if (res.success) addToast('Servicio actualizado');
				else addToast(res.error || 'Error al actualizar', 'error');
			} else {
				const res = await api('/services', {
					method: 'POST',
					body: JSON.stringify(payload)
				});
				if (res.success) addToast('Servicio creado');
				else addToast(res.error || 'Error al crear', 'error');
			}
			modalOpen = false;
			await invalidateAll();
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		const res = await api(`/services/${deleteId}`, { method: 'DELETE' });
		if (res.success) {
			addToast('Servicio eliminado');
			await invalidateAll();
		} else {
			addToast(res.error || 'Error al eliminar', 'error');
		}
	}
</script>

<svelte:head>
	<title>Servicios | VR Hair Studio</title>
</svelte:head>

<PageHeader title="Servicios" description="Gestionar servicios y precios">
	{#snippet actions()}
		<Button onclick={openCreate}>+ Nuevo servicio</Button>
	{/snippet}
</PageHeader>

{#if data.categories.length === 0}
	<Card class="p-8 text-center">
		<p class="text-gray-dark font-body">Primero creá categorías para poder agregar servicios.</p>
	</Card>
{:else}
	<!-- Category filter tabs -->
	<div class="flex items-center gap-1.5 sm:gap-2 mb-6 flex-wrap">
		<button
			onclick={() => filterByCategory('')}
			class="px-2.5 py-1 sm:px-3 text-xs font-body rounded-full transition-colors cursor-pointer
				   {!data.categoryFilter ? 'bg-teal text-white' : 'bg-blush text-gray-dark hover:bg-blush-medium'}"
		>Todas</button>
		{#each data.categories as cat}
			<button
				onclick={() => filterByCategory(cat._id)}
				class="px-2.5 py-1 sm:px-3 text-xs font-body rounded-full transition-colors cursor-pointer
					   {data.categoryFilter === cat._id ? 'bg-teal text-white' : 'bg-blush text-gray-dark hover:bg-blush-medium'}"
			>{cat.emoji} {cat.name}</button>
		{/each}
	</div>

	<div class="space-y-6">
		{#each visibleCategories as cat}
			{@const catServices = servicesByCategory().get(cat._id) || []}
			<Card>
				<div class="px-5 py-4 border-b border-blush-medium/30 bg-teal/5">
					<h2 class="font-heading text-lg font-bold text-charcoal flex items-center gap-2">
						{#if cat.emoji}<span>{cat.emoji}</span>{/if}
						{cat.name}
						<span class="text-sm font-body font-normal text-gray-dark">({catServices.length})</span>
					</h2>
				</div>

				{#if catServices.length === 0}
					<div class="p-5 text-center text-gray-dark/60 font-body text-sm">
						Sin servicios en esta categoría
					</div>
				{:else}
					<div class="divide-y divide-blush-medium/30">
						{#each catServices as svc, i}
							<div
								class="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3 gap-2 sm:gap-4
									   {i % 2 === 0 ? 'bg-white' : 'bg-blush/20'}
									   hover:bg-blush-medium/20 transition-colors"
							>
								<div class="flex-1 min-w-0">
									<span class="font-body text-charcoal">{svc.name}</span>
									{#if svc.description}
										<span class="text-gray-dark/60 text-xs ml-2 hidden sm:inline">{svc.description}</span>
										<p class="text-gray-dark/60 text-xs mt-0.5 sm:hidden">{svc.description}</p>
									{/if}
								</div>
								<div class="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
									<span class="font-body font-bold text-teal-dark whitespace-nowrap">
										{formatCurrency(svc.price)}
									</span>
									<div class="flex items-center gap-1">
										<button
											onclick={() => openEdit(svc)}
											class="p-2 sm:p-1.5 text-gray-dark hover:text-teal hover:bg-blush rounded-lg transition-colors cursor-pointer"
										>
											<svg class="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
												<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
											</svg>
										</button>
										<button
											onclick={() => openDelete(svc._id)}
											class="p-2 sm:p-1.5 text-gray-dark hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
										>
											<svg class="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
												<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
											</svg>
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card>
		{/each}
	</div>

	<Pagination
		currentPage={data.pagination.page}
		totalPages={data.pagination.totalPages}
		total={data.pagination.total}
	/>
{/if}

<!-- Create/Edit Modal -->
<Modal bind:open={modalOpen} title={editing ? 'Editar servicio' : 'Nuevo servicio'}>
	<form onsubmit={handleSave} class="space-y-4">
		<Select label="Categoría" bind:value={form.categoryId} options={categoryOptions} required />
		<Input label="Nombre" bind:value={form.name} required placeholder="Ej: Corte" />
		<Input label="Precio" type="number" bind:value={form.price} required placeholder="Ej: 25000" />
		<Input label="Descripción" bind:value={form.description} placeholder="Opcional" />

		<div class="flex justify-end gap-3 pt-2">
			<Button variant="ghost" onclick={() => (modalOpen = false)}>Cancelar</Button>
			<Button type="submit" {loading}>{editing ? 'Guardar' : 'Crear'}</Button>
		</div>
	</form>
</Modal>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Eliminar servicio"
	message="¿Estás segura de que querés eliminar este servicio?"
	confirmLabel="Eliminar"
	onConfirm={handleDelete}
/>
