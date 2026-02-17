<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import { STATUS_LABELS, STATUS_COLORS, PAYMENT_LABELS, APPOINTMENT_STATUSES } from '$lib/utils/constants';
	import { api } from '$lib/utils/api';
	import { addToast } from '$lib/stores/toast';
	import type { AppointmentStatus, PaymentMethod } from '$lib/types';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CalendarView from '$lib/components/appointments/CalendarView.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';

	let { data } = $props();

	let view = $state<'calendar' | 'table'>('calendar');
	let currentDate = $state(new Date());
	let selectedDate = $state<Date | null>(null);
	let statusFilter = $state('');
	let actionLoading = $state<string | null>(null);

	const filteredAppointments = $derived(() => {
		let appts = data.appointments;

		if (selectedDate) {
			appts = appts.filter((a) => {
				const d = new Date(a.date);
				return d.getUTCFullYear() === selectedDate!.getFullYear() &&
					d.getUTCMonth() === selectedDate!.getMonth() &&
					d.getUTCDate() === selectedDate!.getDate();
			});
		}

		if (statusFilter) {
			appts = appts.filter((a) => a.status === statusFilter);
		}

		return appts;
	});

	function handleDateSelect(date: Date) {
		if (selectedDate?.getTime() === date.getTime()) {
			selectedDate = null;
		} else {
			selectedDate = date;
		}
	}

	async function updateStatus(id: string, status: AppointmentStatus) {
		actionLoading = id;
		try {
			const res = await api(`/appointments/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ status })
			});
			if (res.success) {
				addToast(`Turno marcado como ${STATUS_LABELS[status].toLowerCase()}`);
				await invalidateAll();
			} else {
				addToast('Error al actualizar estado', 'error');
			}
		} finally {
			actionLoading = null;
		}
	}

	async function togglePaid(id: string, currentPaid: boolean) {
		actionLoading = id;
		try {
			const res = await api(`/appointments/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ paid: !currentPaid })
			});
			if (res.success) {
				addToast(!currentPaid ? 'Turno marcado como pagado' : 'Pago desmarcado');
				await invalidateAll();
			} else {
				addToast('Error al actualizar pago', 'error');
			}
		} finally {
			actionLoading = null;
		}
	}
</script>

<svelte:head>
	<title>Turnos | VR Hair Studio</title>
</svelte:head>

<PageHeader title="Turnos" description="Gestionar citas y reservas">
	{#snippet actions()}
		<div class="flex items-center gap-2">
			<div class="flex bg-blush rounded-lg p-0.5">
				<button
					onclick={() => (view = 'calendar')}
					class="px-3 py-1.5 text-sm font-body rounded-md transition-colors cursor-pointer
						   {view === 'calendar' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-dark'}"
				>Calendario</button>
				<button
					onclick={() => (view = 'table')}
					class="px-3 py-1.5 text-sm font-body rounded-md transition-colors cursor-pointer
						   {view === 'table' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-dark'}"
				>Tabla</button>
			</div>
			<Button onclick={() => window.location.href = '/appointments/new'}>+ Nuevo turno</Button>
		</div>
	{/snippet}
</PageHeader>

{#if selectedDate}
	<div class="mb-4 flex items-center gap-2">
		<span class="font-body text-sm text-gray-dark">
			Mostrando: <strong class="text-charcoal">{formatDate(selectedDate)}</strong>
		</span>
		<button
			onclick={() => (selectedDate = null)}
			class="text-xs text-teal hover:text-teal-dark font-body cursor-pointer"
		>Ver todo</button>
	</div>
{/if}

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
	<!-- Calendar (always visible on large screens, toggle on mobile) -->
	{#if view === 'calendar' || window?.innerWidth >= 1024}
		<div class="lg:col-span-1 {view === 'table' ? 'hidden lg:block' : ''}">
			<CalendarView
				appointments={data.appointments}
				bind:currentDate
				{selectedDate}
				onDateSelect={handleDateSelect}
			/>
		</div>
	{/if}

	<!-- Appointments list -->
	<div class="{view === 'calendar' ? 'lg:col-span-2' : 'lg:col-span-3'}">
		<!-- Status filter -->
		<div class="flex items-center gap-1.5 sm:gap-2 mb-4 flex-wrap">
			<button
				onclick={() => (statusFilter = '')}
				class="px-2.5 py-1 sm:px-3 text-xs font-body rounded-full transition-colors cursor-pointer
					   {statusFilter === '' ? 'bg-teal text-white' : 'bg-blush text-gray-dark hover:bg-blush-medium'}"
			>Todos</button>
			{#each APPOINTMENT_STATUSES as s}
				<button
					onclick={() => (statusFilter = statusFilter === s ? '' : s)}
					class="px-2.5 py-1 sm:px-3 text-xs font-body rounded-full transition-colors cursor-pointer
						   {statusFilter === s ? 'bg-teal text-white' : 'bg-blush text-gray-dark hover:bg-blush-medium'}"
				>{STATUS_LABELS[s]}</button>
			{/each}
		</div>

		{#if filteredAppointments().length === 0}
			<Card class="p-8 text-center">
				<p class="text-gray-dark font-body">
					{selectedDate ? 'No hay turnos para esta fecha.' : 'No hay turnos en este período.'}
				</p>
			</Card>
		{:else}
			<div class="space-y-3">
				{#each filteredAppointments() as apt}
					<Card class="p-4 hover:shadow-md transition-shadow">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div class="flex-1">
								<div class="flex items-center gap-2 mb-1 flex-wrap">
									<span class="font-body text-sm font-semibold text-charcoal">
										{apt.time}
									</span>
									<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body {STATUS_COLORS[apt.status as AppointmentStatus]}">
										{STATUS_LABELS[apt.status as AppointmentStatus]}
									</span>
									{#if apt.paid}
										<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body bg-green-100 text-green-800">
											Pagado
										</span>
									{:else if apt.status === 'completado'}
										<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body bg-amber-100 text-amber-800">
											Sin cobrar
										</span>
									{/if}
								</div>
								<p class="font-body text-charcoal">
									{#if apt.clients?.length > 0}
										{#each apt.clients as client, i}
											<a href="/clients/{client._id}" class="hover:text-teal transition-colors">{client.name}</a>{#if i < apt.clients.length - 1}, {/if}
										{/each}
									{:else}
										<span class="text-gray-dark">Cliente desconocido</span>
									{/if}
								</p>
								<p class="text-sm text-gray-dark font-body mt-0.5">
									{apt.services.map((s: { name: string }) => s.name).join(' + ')}
								</p>
								<div class="flex items-center gap-3 mt-1">
									<span class="text-xs text-gray-dark/60 font-body">
										{formatDate(apt.date)}
									</span>
									<span class="text-xs text-gray-dark/60 font-body">
										{PAYMENT_LABELS[apt.paymentMethod as PaymentMethod]}
									</span>
								</div>
							</div>
							<div class="flex items-center justify-between sm:justify-end gap-3">
								<span class="font-body text-lg font-bold text-teal-dark">
									{formatCurrency(apt.totalPrice)}
								</span>
							</div>
							<!-- Action buttons -->
							<div class="flex items-center gap-2 mt-3 pt-3 border-t border-blush-medium/30 flex-wrap" class:opacity-50={actionLoading === apt._id}>
								{#if apt.status === 'pendiente'}
									<button
										onclick={() => updateStatus(apt._id, 'confirmado')}
										disabled={actionLoading !== null}
										class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-body font-medium text-teal bg-teal/10 hover:bg-teal/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
										</svg>
										Confirmar
									</button>
								{/if}
								{#if apt.status === 'confirmado'}
									<button
										onclick={() => updateStatus(apt._id, 'completado')}
										disabled={actionLoading !== null}
										class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-body font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Completar
									</button>
								{/if}
								{#if apt.status === 'completado' && !apt.paid}
									<button
										onclick={() => togglePaid(apt._id, apt.paid)}
										disabled={actionLoading !== null}
										class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-body font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
										</svg>
										Cobrar
									</button>
								{/if}
								{#if apt.paid}
									<button
										onclick={() => togglePaid(apt._id, apt.paid)}
										disabled={actionLoading !== null}
										class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-body font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
										</svg>
										Pagado
									</button>
								{/if}
								<a
									href="/appointments/{apt._id}"
									class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-body font-medium text-gray-dark bg-blush hover:bg-blush-medium rounded-lg transition-colors"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
									</svg>
									Editar
								</a>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		{/if}

		<Pagination
			currentPage={data.pagination.page}
			totalPages={data.pagination.totalPages}
			total={data.pagination.total}
		/>
	</div>
</div>
