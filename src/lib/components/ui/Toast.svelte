<script lang="ts">
	import { toasts, removeToast } from '$lib/stores/toast';

	const typeStyles = {
		success: 'bg-green-50 text-green-800 border-green-200',
		error: 'bg-red-50 text-red-800 border-red-200',
		info: 'bg-teal-light text-teal-dark border-teal/30'
	};
</script>

{#if $toasts.length > 0}
	<div class="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[100] space-y-2 pointer-events-none">
		{#each $toasts as toast (toast.id)}
			<div
				class="pointer-events-auto px-4 py-3 rounded-lg border shadow-lg font-body text-sm
					   sm:max-w-sm transform transition-all duration-300 {typeStyles[toast.type]}"
			>
				<div class="flex items-center justify-between gap-3">
					<span>{toast.message}</span>
					<button
						onclick={() => removeToast(toast.id)}
						class="shrink-0 opacity-60 hover:opacity-100 cursor-pointer"
						aria-label="Cerrar"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}
