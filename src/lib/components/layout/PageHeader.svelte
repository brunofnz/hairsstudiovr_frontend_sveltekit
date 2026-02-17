<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description = '',
		actions
	}: {
		title: string;
		description?: string;
		actions?: Snippet;
	} = $props();
</script>

<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
	<div>
		<h1 class="font-heading text-2xl sm:text-3xl font-bold text-charcoal">{title}</h1>
		{#if description}
			<p class="text-gray-dark font-body text-sm mt-1">{description}</p>
		{/if}
	</div>

	{#if actions}
		<div class="flex items-center gap-2 flex-wrap">
			{@render actions()}
		</div>
	{/if}
</div>
