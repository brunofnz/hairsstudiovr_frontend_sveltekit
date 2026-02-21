<script lang="ts">
	import type { Appointment } from '$lib/types';
	import { STATUS_COLORS } from '$lib/utils/constants';
	import type { AppointmentStatus } from '$lib/types';

	let {
		appointments = [],
		currentDate = $bindable(new Date()),
		selectedDate = null,
		onDateSelect,
		birthdayDays = []
	}: {
		appointments?: Appointment[];
		currentDate?: Date;
		selectedDate?: Date | null;
		onDateSelect?: (date: Date) => void;
		birthdayDays?: number[];
	} = $props();

	const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

	const year = $derived(currentDate.getFullYear());
	const month = $derived(currentDate.getMonth());

	const monthName = $derived(
		new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(currentDate)
	);

	const calendarDays = $derived(() => {
		const firstDay = new Date(year, month, 1);
		let startDay = firstDay.getDay() - 1;
		if (startDay < 0) startDay = 6;

		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const days: Array<{ date: number; isToday: boolean; isSelected: boolean; appointmentCount: number; hasConfirmed: boolean; hasBirthday: boolean }> = [];

		// Empty slots before first day
		for (let i = 0; i < startDay; i++) {
			days.push({ date: 0, isToday: false, isSelected: false, appointmentCount: 0, hasConfirmed: false, hasBirthday: false });
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let d = 1; d <= daysInMonth; d++) {
			const dayDate = new Date(year, month, d);
			const isToday = dayDate.getTime() === today.getTime();
			const isSelected = selectedDate != null &&
				selectedDate.getFullYear() === year &&
				selectedDate.getMonth() === month &&
				selectedDate.getDate() === d;

			const dayAppts = appointments.filter((a) => {
				const aDate = new Date(a.date);
				return aDate.getUTCFullYear() === year && aDate.getUTCMonth() === month && aDate.getUTCDate() === d;
			});

			days.push({
				date: d,
				isToday,
				isSelected,
				appointmentCount: dayAppts.length,
				hasConfirmed: dayAppts.some((a) => a.status === 'confirmado' || a.status === 'pendiente'),
				hasBirthday: birthdayDays.includes(d)
			});
		}

		return days;
	});

	function prevMonth() {
		currentDate = new Date(year, month - 1, 1);
	}

	function nextMonth() {
		currentDate = new Date(year, month + 1, 1);
	}

	function selectDate(day: number) {
		if (day === 0) return;
		const selected = new Date(year, month, day);
		onDateSelect?.(selected);
	}
</script>

<div class="bg-white rounded-2xl shadow-sm border border-blush-medium/30 overflow-hidden">
	<!-- Header -->
	<div class="flex items-center justify-between px-5 py-4 border-b border-blush-medium/30">
		<button
			onclick={prevMonth}
			class="p-2 rounded-lg hover:bg-blush text-gray-dark transition-colors cursor-pointer"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
			</svg>
		</button>
		<h3 class="font-heading text-lg font-bold text-charcoal capitalize">{monthName}</h3>
		<button
			onclick={nextMonth}
			class="p-2 rounded-lg hover:bg-blush text-gray-dark transition-colors cursor-pointer"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
			</svg>
		</button>
	</div>

	<!-- Day names -->
	<div class="grid grid-cols-7 border-b border-blush-medium/30">
		{#each DAYS as day}
			<div class="text-center py-2 text-xs font-semibold text-gray-dark font-body">{day}</div>
		{/each}
	</div>

	<!-- Days grid -->
	<div class="grid grid-cols-7">
		{#each calendarDays() as day}
			{#if day.date === 0}
				<div class="h-16 sm:h-20"></div>
			{:else}
				<button
					onclick={() => selectDate(day.date)}
					class="h-16 sm:h-20 p-1 border-r border-b border-blush-medium/20 relative
						   hover:bg-blush/30 transition-colors cursor-pointer
						   {day.isSelected ? 'bg-blush-medium/40' : day.isToday ? 'bg-teal-light/20' : ''}
						   {day.hasBirthday && !day.isSelected ? 'ring-1 ring-inset ring-pink-300' : ''}"
				>
					<span
						class="text-sm font-body
							   {day.isToday ? 'bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' : ''}
							   {day.isSelected && !day.isToday ? 'bg-charcoal text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' : ''}
							   {!day.isToday && !day.isSelected ? 'text-charcoal' : ''}"
					>
						{day.date}
					</span>
					{#if day.appointmentCount > 0 || day.hasBirthday}
						<div class="mt-1 flex justify-center gap-0.5">
							{#if day.appointmentCount > 0}
								<span
									class="text-[10px] font-body rounded-full px-1.5 py-0.5
										   {day.hasConfirmed ? 'bg-teal/20 text-teal-dark' : 'bg-blush-medium/50 text-gray-dark'}"
								>
									{day.appointmentCount}
								</span>
							{/if}
							{#if day.hasBirthday}
								<span class="text-[10px] font-body rounded-full px-1 py-0.5 bg-pink-100 text-pink-600">
									🎂
								</span>
							{/if}
						</div>
					{/if}
				</button>
			{/if}
		{/each}
	</div>
</div>
