<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let {
		currentPage = 1,
		totalPages = 1,
		total = 0
	}: {
		currentPage?: number;
		totalPages?: number;
		total?: number;
	} = $props();

	function goToPage(p: number) {
		const url = new URL($page.url);
		if (p <= 1) {
			url.searchParams.delete('page');
		} else {
			url.searchParams.set('page', String(p));
		}
		goto(url.toString(), { keepFocus: true, noScroll: true });
	}

	const pages = $derived(() => {
		const items: (number | '...')[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) items.push(i);
		} else {
			items.push(1);
			if (currentPage > 3) items.push('...');
			for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
				items.push(i);
			}
			if (currentPage < totalPages - 2) items.push('...');
			items.push(totalPages);
		}
		return items;
	});
</script>

{#if totalPages > 1}
	<div class="flex items-center justify-between mt-6 px-1">
		<span class="text-sm text-gray-dark font-body">{total} resultado{total !== 1 ? 's' : ''}</span>
		<div class="flex items-center gap-1">
			<button
				onclick={() => goToPage(currentPage - 1)}
				disabled={currentPage <= 1}
				class="px-2.5 py-1.5 text-sm font-body rounded-lg transition-colors cursor-pointer
					   disabled:opacity-30 disabled:cursor-not-allowed
					   text-gray-dark hover:bg-blush"
			>&laquo;</button>
			{#each pages() as p}
				{#if p === '...'}
					<span class="px-2 py-1.5 text-sm text-gray-dark/50 font-body">...</span>
				{:else}
					<button
						onclick={() => goToPage(p)}
						class="px-3 py-1.5 text-sm font-body rounded-lg transition-colors cursor-pointer
							   {p === currentPage
							   ? 'bg-teal text-white'
							   : 'text-gray-dark hover:bg-blush'}"
					>{p}</button>
				{/if}
			{/each}
			<button
				onclick={() => goToPage(currentPage + 1)}
				disabled={currentPage >= totalPages}
				class="px-2.5 py-1.5 text-sm font-body rounded-lg transition-colors cursor-pointer
					   disabled:opacity-30 disabled:cursor-not-allowed
					   text-gray-dark hover:bg-blush"
			>&raquo;</button>
		</div>
	</div>
{/if}
