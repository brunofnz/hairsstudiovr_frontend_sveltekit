<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';
	import { addToast } from '$lib/stores/toast';
	import { formatCurrency } from '$lib/utils/format';
	import { PAYMENT_LABELS, PAYMENT_METHODS } from '$lib/utils/constants';
	import type { AppointmentService } from '$lib/types';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ServicePicker from '$lib/components/appointments/ServicePicker.svelte';
	import ClientPicker from '$lib/components/appointments/ClientPicker.svelte';

	let { data } = $props();

	let allClients = $state(data.clients);
	let clientIds = $state<string[]>(data.preselectedClientId ? [data.preselectedClientId] : []);
	let selectedServices = $state<AppointmentService[]>([]);
	let date = $state('');
	let time = $state('');
	let paymentMethod = $state('');
	let notes = $state('');
	let loading = $state(false);

	const totalPrice = $derived(selectedServices.reduce((sum, s) => sum + s.price, 0));

	const paymentOptions = PAYMENT_METHODS.map((m) => ({ value: m, label: PAYMENT_LABELS[m] }));

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (clientIds.length === 0 || selectedServices.length === 0 || !date || !time || !paymentMethod) {
			addToast('Completá todos los campos requeridos', 'error');
			return;
		}

		loading = true;

		try {
			const res = await api('/appointments', {
				method: 'POST',
				body: JSON.stringify({
					clientIds,
					services: selectedServices,
					date,
					time,
					paymentMethod,
					notes
				})
			});

			if (res.success) {
				addToast('Turno creado');
				goto('/appointments');
			} else {
				addToast(res.error || 'Error al crear turno', 'error');
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Nuevo Turno | VR Hair Studio</title>
</svelte:head>

<PageHeader title="Nuevo Turno" description="Registrar una nueva cita">
	{#snippet actions()}
		<Button variant="ghost" onclick={() => history.back()}>Cancelar</Button>
	{/snippet}
</PageHeader>

<Card class="p-4 sm:p-6 max-w-3xl">
	<form onsubmit={handleSubmit} class="space-y-6">
		<!-- Clients -->
		<ClientPicker bind:clients={allClients} bind:selected={clientIds} />

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
		<Select
			label="Medio de pago"
			bind:value={paymentMethod}
			options={paymentOptions}
			required
		/>

		<!-- Notes -->
		<Input label="Notas" bind:value={notes} placeholder="Observaciones del turno..." />

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
			<Button type="submit" {loading} size="lg">Crear Turno</Button>
		</div>
	</form>
</Card>
