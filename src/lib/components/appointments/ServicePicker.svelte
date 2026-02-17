<script lang="ts">
	import { formatCurrency } from '$lib/utils/format';
	import type { Category, Service, AppointmentService } from '$lib/types';

	let {
		categories = [],
		services = [],
		selected = $bindable<AppointmentService[]>([])
	}: {
		categories?: Category[];
		services?: Service[];
		selected?: AppointmentService[];
	} = $props();

	const totalPrice = $derived(selected.reduce((sum, s) => sum + s.price, 0));

	function isSelected(serviceId: string): boolean {
		return selected.some((s) => s.serviceId === serviceId);
	}

	function toggleService(svc: Service) {
		if (isSelected(svc._id)) {
			selected = selected.filter((s) => s.serviceId !== svc._id);
		} else {
			selected = [...selected, { serviceId: svc._id, name: svc.name, price: svc.price }];
		}
	}

	function getServicesByCategory(categoryId: string): Service[] {
		return services.filter((s) => s.categoryId === categoryId);
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<label class="block text-sm font-medium text-gray-dark font-body">
			Servicios <span class="text-red-500">*</span>
		</label>
		{#if selected.length > 0}
			<span class="text-sm font-bold text-teal-dark font-body">
				Total: {formatCurrency(totalPrice)}
			</span>
		{/if}
	</div>

	{#each categories as cat}
		{@const catServices = getServicesByCategory(cat._id)}
		{#if catServices.length > 0}
			<div>
				<p class="text-xs font-semibold text-gray-dark font-body uppercase tracking-wide mb-2">
					{cat.emoji} {cat.name}
				</p>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
					{#each catServices as svc}
						<button
							type="button"
							onclick={() => toggleService(svc)}
							class="flex items-center justify-between px-3 py-2.5 rounded-lg border text-left
								   transition-all duration-200 cursor-pointer
								   {isSelected(svc._id)
									? 'border-teal bg-teal/10 ring-1 ring-teal'
									: 'border-blush-medium bg-white hover:border-teal/50'}"
						>
							<span class="font-body text-sm text-charcoal">{svc.name}</span>
							<span class="font-body text-sm font-semibold text-teal-dark whitespace-nowrap ml-2">
								{formatCurrency(svc.price)}
							</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	{/each}

	{#if selected.length > 0}
		<div class="bg-blush/50 rounded-lg p-3">
			<p class="text-xs text-gray-dark font-body mb-1">Seleccionados:</p>
			<div class="flex flex-wrap gap-1">
				{#each selected as svc}
					<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal/10 text-teal-dark text-xs font-body">
						{svc.name}
						<button
							type="button"
							onclick={() => (selected = selected.filter((s) => s.serviceId !== svc.serviceId))}
							class="hover:text-red-500 cursor-pointer"
						>×</button>
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>
