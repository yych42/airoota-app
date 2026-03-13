<script lang="ts">
	import { Clock } from 'lucide-svelte';

	let {
		value = $bindable(''),
		label = '時間',
		placeholder = '選擇時間'
	}: {
		value?: string;
		label?: string;
		placeholder?: string;
	} = $props();

	let hour = $state('');
	let minute = $state('');
	let open = $state(false);

	$effect(() => {
		if (value && value.includes(':')) {
			const [h, m] = value.split(':');
			hour = h;
			minute = m;
		}
	});

	// Scroll selected hour/minute into view when opening
	function scrollToSelected() {
		setTimeout(() => {
			if (hour) {
				const el = document.getElementById(`hour-${hour}`);
				el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
			}
			if (minute) {
				const el = document.getElementById(`min-${minute}`);
				el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
			}
		}, 0);
	}

	$effect(() => {
		if (open) scrollToSelected();
	});

	const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
	const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

	// Period of day for each hour
	type Period = 'dawn' | 'day' | 'dusk' | 'night';

	function getPeriod(h: number): Period {
		if (h >= 5 && h < 8) return 'dawn';
		if (h >= 8 && h < 17) return 'day';
		if (h >= 17 && h < 20) return 'dusk';
		return 'night';
	}

	function getPeriodLabel(h: number): string {
		if (h < 5) return '凌晨';
		if (h < 8) return '清晨';
		if (h < 12) return '上午';
		if (h < 13) return '中午';
		if (h < 17) return '下午';
		if (h < 20) return '傍晚';
		return '晚上';
	}

	function periodBg(period: Period, selected: boolean): string {
		if (selected) return 'bg-amber-500 text-white';
		switch (period) {
			case 'dawn': return 'bg-orange-50/70';
			case 'day': return 'bg-sky-50/60';
			case 'dusk': return 'bg-amber-50/60';
			case 'night': return 'bg-indigo-50/50';
		}
	}

	function periodText(period: Period, selected: boolean): string {
		if (selected) return 'text-white';
		switch (period) {
			case 'dawn': return 'text-orange-400';
			case 'day': return 'text-sky-400';
			case 'dusk': return 'text-amber-500';
			case 'night': return 'text-indigo-400';
		}
	}

	const presets = [
		{ time: '06:00', label: '清晨 6:00', period: 'dawn' as Period },
		{ time: '08:00', label: '上午 8:00', period: 'day' as Period },
		{ time: '10:00', label: '上午 10:00', period: 'day' as Period },
		{ time: '12:00', label: '中午 12:00', period: 'day' as Period },
		{ time: '14:00', label: '下午 14:00', period: 'day' as Period },
		{ time: '16:00', label: '下午 16:00', period: 'day' as Period },
		{ time: '18:00', label: '傍晚 18:00', period: 'dusk' as Period },
		{ time: '20:00', label: '晚上 20:00', period: 'night' as Period },
		{ time: '22:00', label: '晚上 22:00', period: 'night' as Period },
	];

	function setHour(h: string) {
		hour = h;
		value = `${h}:${minute || '00'}`;
		if (!minute) minute = '00';
	}

	function setMinute(m: string) {
		minute = m;
		value = `${hour || '00'}:${m}`;
		if (!hour) hour = '00';
	}

	function selectPreset(time: string) {
		const [h, m] = time.split(':');
		hour = h;
		minute = m;
		value = time;
		// Scroll to the selected hour/minute instead of closing
		scrollToSelected();
	}

	let displayValue = $derived(
		hour && minute ? `${hour}:${minute}` : ''
	);

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.time-picker-container')) {
			open = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="time-picker-container relative">
	<label class="mb-2 block text-sm font-semibold text-navy-700">
		<Clock size={14} class="mb-0.5 mr-1 inline text-navy-400" />
		{label}
	</label>

	<button
		type="button"
		onclick={() => (open = !open)}
		class="flex w-full items-center justify-between rounded-xl border border-navy-200 bg-white px-4 py-3.5 text-left text-sm transition-all hover:border-navy-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none {displayValue ? 'text-navy-900' : 'text-navy-300'}"
	>
		<span class="font-medium {displayValue ? 'font-mono tracking-wide' : ''}">{displayValue || placeholder}</span>
		<Clock size={16} class="text-navy-400" />
	</button>

	{#if open}
		<div class="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-xl shadow-navy-900/10">
			<!-- Quick presets -->
			<div class="border-b border-navy-100 px-4 py-3">
				<div class="flex flex-wrap gap-1.5">
					{#each presets as p}
						{@const selected = value === p.time}
						<button
							type="button"
							onclick={() => selectPreset(p.time)}
							class="rounded-full px-3 py-1.5 text-xs font-medium transition-all
								{selected
									? 'bg-amber-500 text-white shadow-sm'
									: `${periodBg(p.period, false)} text-navy-600 hover:brightness-95 active:brightness-90`}"
						>
							{p.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Hour & Minute columns -->
			<div class="flex">
				<!-- Hours -->
				<div class="flex-1 border-r border-navy-100">
					<div class="sticky top-0 bg-white px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-navy-400">時</div>
					<div class="h-48 overflow-y-auto pb-1">
						{#each hours as h}
							{@const n = Number(h)}
							{@const period = getPeriod(n)}
							{@const selected = hour === h}
							<button
								id="hour-{h}"
								type="button"
								onclick={() => setHour(h)}
								class="flex w-full items-center gap-2 px-3 py-2 transition-all {periodBg(period, selected)}
									{selected ? '' : 'hover:brightness-95 active:brightness-90'}"
							>
								<span class="font-mono text-sm font-semibold tracking-wider {selected ? 'text-white' : 'text-navy-800'}">
									{h}
								</span>
								<span class="text-[11px] {periodText(period, selected)}">
									{getPeriodLabel(n)}
								</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Minutes -->
				<div class="w-[5.5rem]">
					<div class="sticky top-0 bg-white px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-navy-400">分</div>
					<div class="h-48 overflow-y-auto pb-1">
						{#each minutes as m}
							{@const selected = minute === m}
							<button
								id="min-{m}"
								type="button"
								onclick={() => setMinute(m)}
								class="w-full px-3 py-2 text-left font-mono text-sm font-semibold tracking-wider transition-all
									{selected
										? 'bg-amber-500 text-white'
										: 'text-navy-700 hover:bg-navy-50 active:bg-navy-100'}"
							>
								{m}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Confirm -->
			{#if hour && minute}
				<div class="border-t border-navy-100 px-4 py-3">
					<button
						type="button"
						onclick={() => (open = false)}
						class="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-600 active:scale-[0.98]"
					>
						確認 <span class="font-mono tracking-wider">{hour}:{minute}</span>
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
