<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		type = 'button',
		onclick,
		class: className = '',
		children
	}: {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (e: MouseEvent) => void;
		class?: string;
		children: Snippet;
	} = $props();

	const variants = {
		primary: 'bg-teal text-white hover:bg-teal-dark focus:ring-teal',
		secondary: 'bg-blush text-charcoal hover:bg-blush-medium focus:ring-blush-medium',
		danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
		ghost: 'bg-transparent text-gray-dark hover:bg-blush focus:ring-teal'
	};

	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2.5 text-sm',
		lg: 'px-6 py-3 text-base'
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="inline-flex items-center justify-center gap-2 font-body font-semibold rounded-lg
		   focus:outline-none focus:ring-2 focus:ring-offset-2
		   disabled:opacity-50 disabled:cursor-not-allowed
		   transition-all duration-200 cursor-pointer
		   {variants[variant]} {sizes[size]} {className}"
>
	{#if loading}
		<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
		</svg>
	{/if}
	{@render children()}
</button>
