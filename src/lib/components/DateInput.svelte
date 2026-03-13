<script lang="ts">
	import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-svelte';

	let {
		value = $bindable(''),
		label = '日期',
		placeholder = '選擇日期'
	}: {
		value?: string;
		label?: string;
		placeholder?: string;
	} = $props();

	let open = $state(false);

	// Calendar state
	let viewYear = $state(new Date().getFullYear());
	let viewMonth = $state(new Date().getMonth()); // 0-indexed

	const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

	let displayValue = $derived(() => {
		if (!value) return '';
		const [y, m, d] = value.split('-').map(Number);
		return `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`;
	});

	// Generate calendar grid for the current view month
	let calendarDays = $derived(() => {
		const firstDay = new Date(viewYear, viewMonth, 1);
		const startDow = firstDay.getDay(); // 0=Sun
		const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
		const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

		const days: { day: number; month: 'prev' | 'current' | 'next'; dateStr: string }[] = [];

		// Previous month fill
		for (let i = startDow - 1; i >= 0; i--) {
			const d = daysInPrevMonth - i;
			const m = viewMonth === 0 ? 11 : viewMonth - 1;
			const y = viewMonth === 0 ? viewYear - 1 : viewYear;
			days.push({ day: d, month: 'prev', dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
		}

		// Current month
		for (let d = 1; d <= daysInMonth; d++) {
			days.push({ day: d, month: 'current', dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
		}

		// Next month fill (to complete 6 rows)
		const remaining = 42 - days.length;
		for (let d = 1; d <= remaining; d++) {
			const m = viewMonth === 11 ? 0 : viewMonth + 1;
			const y = viewMonth === 11 ? viewYear + 1 : viewYear;
			days.push({ day: d, month: 'next', dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
		}

		// Split into weeks
		const weeks: typeof days[] = [];
		for (let i = 0; i < days.length; i += 7) {
			weeks.push(days.slice(i, i + 7));
		}
		return weeks;
	});

	const todayStr = (() => {
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	})();

	function isBeforeToday(dateStr: string): boolean {
		return dateStr < todayStr;
	}

	function prevMonth() {
		if (viewMonth === 0) { viewMonth = 11; viewYear--; }
		else { viewMonth--; }
	}

	function nextMonth() {
		if (viewMonth === 11) { viewMonth = 0; viewYear++; }
		else { viewMonth++; }
	}

	function selectDate(dateStr: string) {
		value = dateStr;
		open = false;
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.date-picker-container')) {
			open = false;
		}
	}

	const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
</script>

<svelte:window onclick={handleClickOutside} />

<div class="date-picker-container relative">
	<label class="mb-2 block text-sm font-semibold text-navy-700">
		<CalendarDays size={14} class="mb-0.5 mr-1 inline text-navy-400" />
		{label}
	</label>

	<button
		type="button"
		onclick={() => { open = !open; if (open && value) { const [y, m] = value.split('-').map(Number); viewYear = y; viewMonth = m - 1; } }}
		class="flex w-full items-center justify-between rounded-xl border border-navy-200 bg-white px-4 py-3.5 text-left text-sm font-medium transition-all hover:border-navy-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none {displayValue() ? 'text-navy-900' : 'text-navy-300'}"
	>
		{displayValue() || placeholder}
		<CalendarDays size={16} class="text-navy-400" />
	</button>

	{#if open}
		<div class="absolute left-0 right-0 top-full z-[100] mt-2 rounded-2xl border border-navy-100 bg-white p-4 shadow-xl shadow-navy-900/10">
			<!-- Month navigation -->
			<div class="mb-3 flex items-center justify-between">
				<button
					type="button"
					onclick={prevMonth}
					class="flex h-8 w-8 items-center justify-center rounded-lg text-navy-500 transition-colors hover:bg-navy-50 active:bg-navy-100"
				>
					<ChevronLeft size={18} />
				</button>
				<span class="text-sm font-bold text-navy-900">{viewYear}年 {monthNames[viewMonth]}</span>
				<button
					type="button"
					onclick={nextMonth}
					class="flex h-8 w-8 items-center justify-center rounded-lg text-navy-500 transition-colors hover:bg-navy-50 active:bg-navy-100"
				>
					<ChevronRight size={18} />
				</button>
			</div>

			<!-- Weekday headers -->
			<div class="mb-1 grid grid-cols-7 gap-0">
				{#each weekdays as wd}
					<div class="pb-2 text-center text-xs font-medium text-navy-400">{wd}</div>
				{/each}
			</div>

			<!-- Calendar grid -->
			{#each calendarDays() as week}
				<div class="grid grid-cols-7 gap-0">
					{#each week as day}
						{@const isSelected = day.dateStr === value}
						{@const isToday = day.dateStr === todayStr}
						{@const isDisabled = isBeforeToday(day.dateStr)}
						{@const isOutside = day.month !== 'current'}
						<button
							type="button"
							onclick={() => { if (!isDisabled) selectDate(day.dateStr); }}
							disabled={isDisabled}
							class="flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-all
								{isSelected ? 'bg-amber-500 text-white shadow-sm' : ''}
								{isOutside && !isSelected ? 'text-navy-200' : ''}
								{!isOutside && !isSelected && !isDisabled ? 'text-navy-700 hover:bg-navy-50 active:bg-navy-100' : ''}
								{isDisabled && !isSelected ? 'cursor-not-allowed text-navy-200' : ''}
								{isToday && !isSelected ? 'font-bold text-amber-600' : ''}"
						>
							{day.day}
						</button>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>
