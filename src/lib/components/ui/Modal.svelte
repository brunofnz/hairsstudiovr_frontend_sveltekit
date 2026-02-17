<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title = '',
		children,
		size = 'md'
	}: {
		open?: boolean;
		title?: string;
		children: Snippet;
		size?: 'sm' | 'md' | 'lg';
	} = $props();

	const sizes = {
		sm: 'max-w-sm',
		md: 'max-w-lg',
		lg: 'max-w-2xl'
	};

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/50 transition-opacity"
			onclick={() => (open = false)}
			role="button"
			tabindex="-1"
		></div>

		<!-- Modal -->
		<div
			class="relative bg-white rounded-2xl shadow-xl w-full {sizes[size]}
				   transform transition-all duration-200 max-h-[90vh] flex flex-col"
		>
			{#if title}
				<div class="flex items-center justify-between px-6 py-4 border-b border-blush-medium/50">
					<h2 class="font-heading text-xl font-bold text-charcoal">{title}</h2>
					<button
						onclick={() => (open = false)}
						class="p-1 rounded-lg text-gray-dark hover:bg-blush transition-colors cursor-pointer"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			{/if}

			<div class="px-6 py-4 overflow-y-auto">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
