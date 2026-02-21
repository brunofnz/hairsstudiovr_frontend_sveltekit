<script lang="ts">
	import { formatCurrency, formatDate, formatBirthday } from '$lib/utils/format';
	import { STATUS_LABELS, STATUS_COLORS, PAYMENT_LABELS } from '$lib/utils/constants';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { AppointmentStatus, PaymentMethod } from '$lib/types';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.client.name} | VR Hair Studio</title>
</svelte:head>

<PageHeader title={data.client.name} description="Detalle del cliente">
	{#snippet actions()}
		<Button variant="secondary" onclick={() => history.back()}>Volver</Button>
		<Button onclick={() => window.location.href = `/appointments/new?clientId=${data.client._id}`}>
			+ Nuevo turno
		</Button>
	{/snippet}
</PageHeader>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
	<!-- Client Info -->
	<Card class="p-5">
		<h3 class="font-heading text-lg font-bold text-charcoal mb-4">Información</h3>
		<div class="space-y-3 font-body text-sm">
			<div>
				<span class="text-gray-dark">Teléfono:</span>
				<span class="text-charcoal ml-2">{data.client.phone}</span>
			</div>
			{#if data.client.email}
				<div>
					<span class="text-gray-dark">Email:</span>
					<span class="text-charcoal ml-2">{data.client.email}</span>
				</div>
			{/if}
			{#if data.client.birthDate}
				<div>
					<span class="text-gray-dark">Cumpleaños:</span>
					<span class="text-charcoal ml-2">{formatBirthday(data.client.birthDate)}</span>
				</div>
			{/if}
			{#if data.client.notes}
				<div>
					<span class="text-gray-dark">Notas:</span>
					<p class="text-charcoal mt-1">{data.client.notes}</p>
				</div>
			{/if}
		</div>
	</Card>

	<!-- Appointment History -->
	<div class="lg:col-span-2">
		<Card>
			<div class="px-5 py-4 border-b border-blush-medium/30">
				<h3 class="font-heading text-lg font-bold text-charcoal">
					Historial de turnos ({data.appointments.length})
				</h3>
			</div>

			{#if data.appointments.length === 0}
				<div class="p-8 text-center text-gray-dark/60 font-body text-sm">
					Sin turnos registrados
				</div>
			{:else}
				<div class="divide-y divide-blush-medium/30">
					{#each data.appointments as apt}
						<a href="/appointments/{apt._id}" class="block px-5 py-4 hover:bg-blush/20 transition-colors">
							<div class="flex items-center justify-between mb-2">
								<span class="font-body text-sm text-charcoal font-medium">
									{formatDate(apt.date)} — {apt.time}
								</span>
								<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body {STATUS_COLORS[apt.status as AppointmentStatus]}">
									{STATUS_LABELS[apt.status as AppointmentStatus]}
								</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm text-gray-dark font-body">
									{apt.services.map((s: { name: string }) => s.name).join(', ')}
								</span>
								<span class="text-sm font-bold text-teal-dark font-body">
									{formatCurrency(apt.totalPrice)}
								</span>
							</div>
							<div class="text-xs text-gray-dark/60 font-body mt-1">
								{PAYMENT_LABELS[apt.paymentMethod as PaymentMethod]}
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</Card>
	</div>
</div>
