<script lang="ts">
	import type { AppointmentStatus } from '$lib/types';
	import { STATUS_LABELS, STATUS_COLORS } from '$lib/utils/constants';

	let {
		status,
		class: className = ''
	}: {
		status: AppointmentStatus;
		class?: string;
	} = $props();
</script>

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body {STATUS_COLORS[status]} {className}">
	{STATUS_LABELS[status]}
</span>
