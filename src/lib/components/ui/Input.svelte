<script lang="ts">
	let {
		label = '',
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		required = false,
		error = '',
		disabled = false,
		class: className = ''
	}: {
		label?: string;
		type?: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		error?: string;
		disabled?: boolean;
		class?: string;
	} = $props();

	const id = $derived(`input-${label.toLowerCase().replace(/\s+/g, '-')}`);
</script>

<div class="space-y-1 {className}">
	{#if label}
		<label for={id} class="block text-sm font-medium text-gray-dark font-body">
			{label}
			{#if required}<span class="text-red-500">*</span>{/if}
		</label>
	{/if}

	<input
		{id}
		{type}
		{placeholder}
		{required}
		{disabled}
		bind:value
		class="w-full px-4 py-2.5 rounded-lg border font-body text-charcoal
			   placeholder:text-gray-dark/50 transition-all duration-200
			   {error
				? 'border-red-400 focus:ring-red-400'
				: 'border-blush-medium focus:ring-teal'}
			   bg-blush/30 focus:outline-none focus:ring-2 focus:border-transparent
			   disabled:opacity-50 disabled:cursor-not-allowed"
	/>

	{#if error}
		<p class="text-red-500 text-xs font-body">{error}</p>
	{/if}
</div>
