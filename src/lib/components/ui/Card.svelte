<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		children
	}: {
		class?: string;
		children: Snippet;
	} = $props();
</script>

<div class="bg-white rounded-2xl shadow-sm border border-blush-medium/30 {className}">
	{@render children()}
</div>
