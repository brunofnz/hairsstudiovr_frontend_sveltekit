<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { api } from '$lib/utils/api';
	import { addToast } from '$lib/stores/toast';
	import { formatCurrency } from '$lib/utils/format';
	import { PAYMENT_LABELS, PAYMENT_METHODS, STATUS_LABELS, APPOINTMENT_STATUSES } from '$lib/utils/constants';
	import type { AppointmentService, AppointmentStatus } from '$lib/types';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import ServicePicker from '$lib/components/appointments/ServicePicker.svelte';
	import ClientPicker from '$lib/components/appointments/ClientPicker.svelte';

	let { data } = $props();

	let allClients = $state(data.clients);
	let clientIds = $state<string[]>(data.appointment.clientIds || []);
	let selectedServices = $state<AppointmentService[]>(
		data.appointment.services.map((s: AppointmentService) => ({
			serviceId: s.serviceId?.toString() || '',
			name: s.name,
			price: s.price
		}))
	);
	let date = $state(data.appointment.date);
	let time = $state(data.appointment.time);
	let paymentMethod = $state(data.appointment.paymentMethod);
	let status = $state(data.appointment.status);
	let paid = $state(data.appointment.paid ?? false);
	let notes = $state(data.appointment.notes || '');
	let loading = $state(false);
	let confirmDelete = $state(false);

	const totalPrice = $derived(selectedServices.reduce((sum, s) => sum + s.price, 0));

	const paymentOptions = PAYMENT_METHODS.map((m) => ({ value: m, label: PAYMENT_LABELS[m] }));
	const statusOptions = APPOINTMENT_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }));

	async function handleSave(e: Event) {
		e.preventDefault();
		loading = true;

		try {
			const res = await api(`/appointments/${data.appointment._id}`, {
				method: 'PUT',
				body: JSON.stringify({
					clientIds,
					services: selectedServices,
					date,
					time,
					paymentMethod,
					status,
					paid,
					notes
				})
			});

			if (res.success) {
				addToast('Turno actualizado');
				await invalidateAll();
			} else {
				addToast(res.error || 'Error al actualizar', 'error');
			}
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		const res = await api(`/appointments/${data.appointment._id}`, { method: 'DELETE' });
		if (res.success) {
			addToast('Turno eliminado');
			goto('/appointments');
		} else {
			addToast(res.error || 'Error al eliminar', 'error');
		}
	}
</script>

<svelte:head>
	<title>Editar Turno | VR Hair Studio</title>
</svelte:head>

<PageHeader title="Editar Turno" description="Modificar datos del turno">
	{#snippet actions()}
		<Button variant="ghost" onclick={() => history.back()}>Volver</Button>
		<Button variant="danger" onclick={() => (confirmDelete = true)}>Eliminar</Button>
	{/snippet}
</PageHeader>

<Card class="p-6 max-w-3xl">
	<form onsubmit={handleSave} class="space-y-6">
		<!-- Clients -->
		<ClientPicker bind:clients={allClients} bind:selected={clientIds} />

		<!-- Status -->
		<Select label="Estado" bind:value={status} options={statusOptions} required />

		<!-- Services -->
		<ServicePicker
			categories={data.categories}
			services={data.services}
			bind:selected={selectedServices}
		/>

		<!-- Date & Time -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<Input label="Fecha" type="date" bind:value={date} required />
			<Input label="Hora" type="time" bind:value={time} required />
		</div>

		<!-- Payment -->
		<Select label="Medio de pago" bind:value={paymentMethod} options={paymentOptions} required />

		<!-- Paid toggle -->
		<label class="flex items-center gap-3 cursor-pointer">
			<div class="relative">
				<input
					type="checkbox"
					bind:checked={paid}
					class="sr-only peer"
				/>
				<div class="w-11 h-6 bg-blush-medium rounded-full peer-checked:bg-green-500 transition-colors"></div>
				<div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
			</div>
			<div>
				<span class="font-body text-sm font-medium text-charcoal">Pagado</span>
				{#if paid}
					<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
						Cobrado
					</span>
				{:else}
					<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
						Pendiente de cobro
					</span>
				{/if}
			</div>
		</label>

		<!-- Notes -->
		<Input label="Notas" bind:value={notes} placeholder="Observaciones..." />

		<!-- Total -->
		{#if selectedServices.length > 0}
			<div class="bg-teal/5 border border-teal/20 rounded-lg p-4 flex items-center justify-between">
				<span class="font-body text-charcoal">
					{selectedServices.length} servicio{selectedServices.length > 1 ? 's' : ''}
				</span>
				<span class="font-heading text-2xl font-bold text-teal-dark">
					{formatCurrency(totalPrice)}
				</span>
			</div>
		{/if}

		<!-- Submit -->
		<div class="flex justify-end gap-3 pt-2">
			<Button variant="ghost" onclick={() => history.back()}>Cancelar</Button>
			<Button type="submit" {loading} size="lg">Guardar cambios</Button>
		</div>
	</form>
</Card>

<ConfirmDialog
	bind:open={confirmDelete}
	title="Eliminar turno"
	message="¿Estás segura de que querés eliminar este turno? Esta acción no se puede deshacer."
	confirmLabel="Eliminar"
	onConfirm={handleDelete}
/>
