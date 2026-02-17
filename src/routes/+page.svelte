<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const data = $derived($page.data);

	$effect(() => {
		if (data.admin) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
	});
</script>
