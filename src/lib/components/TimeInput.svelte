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
	$effect(() => {
		if (open && hour) {
			setTimeout(() => {
				const el = document.getElementById(`hour-${hour}`);
				el?.scrollIntoView({ block: 'center', behavior: 'instant' });
			}, 0);
		}
	});
	$effect(() => {
		if (open && minute) {
			setTimeout(() => {
				const el = document.getElementById(`min-${minute}`);
				el?.scrollIntoView({ block: 'center', behavior: 'instant' });
			}, 0);
		}
	});

	const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
	const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

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
		open = false;
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

	const presets = [
		{ time: '06:00', label: '早班 6:00' },
		{ time: '08:00', label: '上午 8:00' },
		{ time: '10:00', label: '上午 10:00' },
		{ time: '12:00', label: '中午 12:00' },
		{ time: '14:00', label: '下午 2:00' },
		{ time: '16:00', label: '下午 4:00' },
		{ time: '18:00', label: '傍晚 6:00' },
		{ time: '20:00', label: '晚上 8:00' },
		{ time: '22:00', label: '晚上 10:00' },
	];
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
		class="flex w-full items-center justify-between rounded-xl border border-navy-200 bg-white px-4 py-3.5 text-left text-sm font-medium transition-all hover:border-navy-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none {displayValue ? 'text-navy-900' : 'text-navy-300'}"
	>
		{displayValue || placeholder}
		<Clock size={16} class="text-navy-400" />
	</button>

	{#if open}
		<div class="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-xl shadow-navy-900/10">
			<!-- Quick presets -->
			<div class="border-b border-navy-100 px-4 py-3">
				<div class="flex flex-wrap gap-1.5">
					{#each presets as p}
						<button
							type="button"
							onclick={() => selectPreset(p.time)}
							class="rounded-full px-3 py-1.5 text-xs font-medium transition-all
								{value === p.time
									? 'bg-amber-500 text-white shadow-sm'
									: 'bg-navy-50 text-navy-600 hover:bg-navy-100 active:bg-navy-200'}"
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
					<div class="sticky top-0 bg-white px-3 pb-1 pt-2 text-xs font-semibold text-navy-400">時</div>
					<div class="h-48 overflow-y-auto px-2 pb-2">
						{#each hours as h}
							<button
								id="hour-{h}"
								type="button"
								onclick={() => setHour(h)}
								class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-all
									{hour === h
										? 'bg-amber-50 text-amber-700 font-semibold'
										: 'text-navy-700 hover:bg-navy-50 active:bg-navy-100'}"
							>
								{h}
								<span class="ml-1 text-xs text-navy-300">
									{Number(h) < 6 ? '凌晨' : Number(h) < 12 ? '上午' : Number(h) < 18 ? '下午' : '晚上'}
								</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Minutes -->
				<div class="w-24">
					<div class="sticky top-0 bg-white px-3 pb-1 pt-2 text-xs font-semibold text-navy-400">分</div>
					<div class="h-48 overflow-y-auto px-2 pb-2">
						{#each minutes as m}
							<button
								id="min-{m}"
								type="button"
								onclick={() => setMinute(m)}
								class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-all
									{minute === m
										? 'bg-amber-50 text-amber-700 font-semibold'
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
						確認 {hour}:{minute}
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
