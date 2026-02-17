<script lang="ts">
	let {
		label = '',
		value = $bindable(''),
		options = [],
		required = false,
		disabled = false,
		class: className = ''
	}: {
		label?: string;
		value?: string;
		options: Array<{ value: string; label: string }>;
		required?: boolean;
		disabled?: boolean;
		class?: string;
	} = $props();

	const id = $derived(`select-${label.toLowerCase().replace(/\s+/g, '-')}`);
</script>

<div class="space-y-1 {className}">
	{#if label}
		<label for={id} class="block text-sm font-medium text-gray-dark font-body">
			{label}
			{#if required}<span class="text-red-500">*</span>{/if}
		</label>
	{/if}

	<select
		{id}
		{required}
		{disabled}
		bind:value
		class="w-full px-4 py-2.5 rounded-lg border border-blush-medium bg-blush/30
			   focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent
			   font-body text-charcoal transition-all duration-200
			   disabled:opacity-50 disabled:cursor-not-allowed"
	>
		<option value="" disabled>Seleccionar...</option>
		{#each options as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>
