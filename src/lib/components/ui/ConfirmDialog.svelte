<script lang="ts">
	import Button from './Button.svelte';

	let {
		open = $bindable(false),
		title = 'Confirmar',
		message = '',
		confirmLabel = 'Confirmar',
		cancelLabel = 'Cancelar',
		variant = 'danger' as 'primary' | 'danger',
		onConfirm
	}: {
		open?: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'primary' | 'danger';
		onConfirm?: () => void;
	} = $props();

	function handleConfirm() {
		onConfirm?.();
		open = false;
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div
			class="absolute inset-0 bg-black/50"
			onclick={() => (open = false)}
			role="button"
			tabindex="-1"
		></div>

		<div class="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
			<h3 class="font-heading text-lg font-bold text-charcoal mb-2">{title}</h3>
			<p class="text-gray-dark font-body text-sm mb-6">{message}</p>

			<div class="flex items-center justify-end gap-3">
				<Button variant="ghost" onclick={() => (open = false)}>{cancelLabel}</Button>
				<Button {variant} onclick={handleConfirm}>{confirmLabel}</Button>
			</div>
		</div>
	</div>
{/if}
