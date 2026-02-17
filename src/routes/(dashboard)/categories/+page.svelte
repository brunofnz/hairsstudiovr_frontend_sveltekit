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

	let { data } = $props();

	let modalOpen = $state(false);
	let confirmOpen = $state(false);
	let editing = $state(false);
	let editId = $state('');
	let deleteId = $state('');
	let loading = $state(false);

	let form = $state({ name: '', description: '', emoji: '', order: 0 });

	function openCreate() {
		form = { name: '', description: '', emoji: '', order: data.categories.length };
		editing = false;
		editId = '';
		modalOpen = true;
	}

	function openEdit(cat: typeof data.categories[0]) {
		form = { name: cat.name, description: cat.description, emoji: cat.emoji, order: cat.order };
		editing = true;
		editId = cat._id;
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
				const res = await api(`/categories/${editId}`, {
					method: 'PUT',
					body: JSON.stringify(form)
				});
				if (res.success) {
					addToast('Categoría actualizada');
				} else {
					addToast(res.error || 'Error al actualizar', 'error');
				}
			} else {
				const res = await api('/categories', {
					method: 'POST',
					body: JSON.stringify(form)
				});
				if (res.success) {
					addToast('Categoría creada');
				} else {
					addToast(res.error || 'Error al crear', 'error');
				}
			}
			modalOpen = false;
			await invalidateAll();
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		const res = await api(`/categories/${deleteId}`, { method: 'DELETE' });
		if (res.success) {
			addToast('Categoría eliminada');
			await invalidateAll();
		} else {
			addToast(res.error || 'Error al eliminar', 'error');
		}
	}
</script>

<svelte:head>
	<title>Categorías | VR Hair Studio</title>
</svelte:head>

<PageHeader title="Categorías" description="Gestionar categorías de servicios">
	{#snippet actions()}
		<Button onclick={openCreate}>+ Nueva categoría</Button>
	{/snippet}
</PageHeader>

{#if data.categories.length === 0}
	<Card class="p-8 text-center">
		<p class="text-gray-dark font-body">No hay categorías. Creá la primera o ejecutá el seed.</p>
	</Card>
{:else}
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each data.categories as cat}
			<Card class="p-5 hover:shadow-md transition-shadow">
				<div class="flex items-start justify-between">
					<div class="flex items-center gap-3">
						{#if cat.emoji}
							<span class="text-2xl">{cat.emoji}</span>
						{/if}
						<div>
							<h3 class="font-heading text-lg font-bold text-charcoal">{cat.name}</h3>
							{#if cat.description}
								<p class="text-gray-dark text-sm font-body mt-0.5">{cat.description}</p>
							{/if}
							<p class="text-teal text-xs font-body mt-1">
								{cat.serviceCount} servicio{cat.serviceCount !== 1 ? 's' : ''}
							</p>
						</div>
					</div>
					<div class="flex items-center gap-1">
						<button
							onclick={() => openEdit(cat)}
							class="p-2 text-gray-dark hover:text-teal hover:bg-blush rounded-lg transition-colors cursor-pointer"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
							</svg>
						</button>
						<button
							onclick={() => openDelete(cat._id)}
							class="p-2 text-gray-dark hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
							</svg>
						</button>
					</div>
				</div>
			</Card>
		{/each}
	</div>
{/if}

<!-- Create/Edit Modal -->
<Modal bind:open={modalOpen} title={editing ? 'Editar categoría' : 'Nueva categoría'}>
	<form onsubmit={handleSave} class="space-y-4">
		<Input label="Nombre" bind:value={form.name} required placeholder="Ej: Peluquería" />
		<Input label="Descripción" bind:value={form.description} placeholder="Opcional" />
		<Input label="Emoji" bind:value={form.emoji} placeholder="Ej: ✂️" />
		<Input label="Orden" type="number" bind:value={form.order} />

		<div class="flex justify-end gap-3 pt-2">
			<Button variant="ghost" onclick={() => (modalOpen = false)}>Cancelar</Button>
			<Button type="submit" {loading}>{editing ? 'Guardar' : 'Crear'}</Button>
		</div>
	</form>
</Modal>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Eliminar categoría"
	message="¿Estás segura de que querés eliminar esta categoría? Esta acción no se puede deshacer."
	confirmLabel="Eliminar"
	onConfirm={handleDelete}
/>
