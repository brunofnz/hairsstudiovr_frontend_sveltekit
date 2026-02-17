<script lang="ts">
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import { STATUS_LABELS, STATUS_COLORS, PAYMENT_LABELS } from '$lib/utils/constants';
	import type { AppointmentStatus, PaymentMethod } from '$lib/types';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();

	const stats = [
		{
			label: 'Turnos hoy',
			value: data.stats.todayCount,
			icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
			color: 'bg-teal/10 text-teal-dark'
		},
		{
			label: 'Total clientes',
			value: data.stats.totalClients,
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
			color: 'bg-blush text-charcoal'
		},
		{
			label: 'Servicios activos',
			value: data.stats.totalServices,
			icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
			color: 'bg-teal-light/30 text-teal-dark'
		},
		{
			label: 'Facturación del mes',
			value: formatCurrency(data.stats.monthlyRevenue),
			icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
			color: 'bg-green-50 text-green-700'
		}
	];
</script>

<svelte:head>
	<title>Dashboard | VR Hair Studio</title>
</svelte:head>

<PageHeader title="Dashboard" description="Resumen general de VR Hair Studio" />

<!-- Stats Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
	{#each stats as stat}
		<Card class="p-5">
			<div class="flex items-center gap-4">
				<div class="p-3 rounded-xl {stat.color}">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d={stat.icon} />
					</svg>
				</div>
				<div>
					<p class="text-sm text-gray-dark font-body">{stat.label}</p>
					<p class="text-2xl font-heading font-bold text-charcoal">{stat.value}</p>
				</div>
			</div>
		</Card>
	{/each}
</div>

<!-- Quick Actions -->
<div class="flex flex-wrap gap-3 mb-8">
	<Button onclick={() => window.location.href = '/appointments/new'}>+ Nuevo turno</Button>
	<Button variant="secondary" onclick={() => window.location.href = '/clients'}>Ver clientes</Button>
	<Button variant="secondary" onclick={() => window.location.href = '/services'}>Ver servicios</Button>
</div>

<!-- Today's Appointments -->
<Card>
	<div class="px-5 py-4 border-b border-blush-medium/30 flex items-center justify-between">
		<h2 class="font-heading text-lg font-bold text-charcoal">Turnos de hoy</h2>
		<a href="/appointments" class="text-sm text-teal hover:text-teal-dark font-body transition-colors">
			Ver todos
		</a>
	</div>

	{#if data.todayAppointments.length === 0}
		<div class="p-8 text-center">
			<p class="text-gray-dark font-body">No hay turnos para hoy</p>
			<Button class="mt-4" onclick={() => window.location.href = '/appointments/new'}>
				Crear turno
			</Button>
		</div>
	{:else}
		<div class="divide-y divide-blush-medium/30">
			{#each data.todayAppointments as apt}
				<a href="/appointments/{apt._id}" class="block px-4 sm:px-5 py-4 hover:bg-blush/20 transition-colors">
					<div class="flex items-start sm:items-center justify-between gap-3">
						<div class="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
							<div class="text-center min-w-[50px] shrink-0">
								<span class="text-lg font-heading font-bold text-teal-dark">{apt.time}</span>
							</div>
							<div class="min-w-0">
								<p class="font-body text-charcoal font-medium truncate">{apt.clients?.map((c: { name: string }) => c.name).join(', ') || 'Sin nombre'}</p>
								<p class="text-sm text-gray-dark font-body truncate">
									{apt.services.map((s: { name: string }) => s.name).join(' + ')}
								</p>
							</div>
						</div>
						<div class="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 shrink-0">
							<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body {STATUS_COLORS[apt.status as AppointmentStatus]}">
								{STATUS_LABELS[apt.status as AppointmentStatus]}
							</span>
							{#if apt.paid}
								<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-body bg-green-100 text-green-800">
									Pagado
								</span>
							{/if}
							<span class="font-body font-bold text-teal-dark text-sm">
								{formatCurrency(apt.totalPrice)}
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</Card>
