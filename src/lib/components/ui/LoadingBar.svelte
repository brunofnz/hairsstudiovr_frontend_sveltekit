<script lang="ts">
	import { navigating } from '$app/stores';
</script>

{#if $navigating}
	<div class="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-blush-medium/30 overflow-hidden">
		<div class="h-full bg-teal animate-loading-bar"></div>
	</div>
{/if}

<style>
	@keyframes loading-bar {
		0% { width: 0%; margin-left: 0%; }
		50% { width: 60%; margin-left: 20%; }
		100% { width: 0%; margin-left: 100%; }
	}
	.animate-loading-bar {
		animation: loading-bar 1.2s ease-in-out infinite;
	}
</style>
