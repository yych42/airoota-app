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

	// Parse HH:MM string
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

	const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
	const minutes = ['00', '15', '30', '45'];

	function selectTime(h: string, m: string) {
		hour = h;
		minute = m;
		value = `${h}:${m}`;
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
		<div class="absolute left-0 right-0 top-full z-[100] mt-2 rounded-2xl border border-navy-100 bg-white p-3 shadow-xl shadow-navy-900/10">
			<!-- Quick presets -->
			<div class="mb-3">
				<p class="mb-2 text-xs font-medium text-navy-400">常用時間</p>
				<div class="flex flex-wrap gap-1.5">
					{#each ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'] as preset}
						<button
							type="button"
							onclick={() => { const [h, m] = preset.split(':'); selectTime(h, m); }}
							class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all
								{value === preset ? 'bg-amber-500 text-white' : 'bg-navy-50 text-navy-700 hover:bg-navy-100 active:bg-navy-200'}"
						>
							{preset}
						</button>
					{/each}
				</div>
			</div>

			<div class="h-px bg-navy-100"></div>

			<!-- Hour/Minute grid -->
			<div class="mt-3 flex gap-3">
				<!-- Hours column -->
				<div class="flex-1">
					<p class="mb-1.5 text-center text-xs font-medium text-navy-400">時</p>
					<div class="grid max-h-40 grid-cols-4 gap-1 overflow-y-auto">
						{#each hours as h}
							<button
								type="button"
								onclick={() => selectTime(h, minute || '00')}
								class="rounded-md py-1.5 text-center text-xs font-medium transition-all
									{hour === h ? 'bg-amber-500 text-white' : 'text-navy-700 hover:bg-navy-50 active:bg-navy-100'}"
							>
								{h}
							</button>
						{/each}
					</div>
				</div>

				<!-- Minutes column -->
				<div class="w-16">
					<p class="mb-1.5 text-center text-xs font-medium text-navy-400">分</p>
					<div class="flex flex-col gap-1">
						{#each minutes as m}
							<button
								type="button"
								onclick={() => selectTime(hour || '00', m)}
								class="rounded-md py-1.5 text-center text-xs font-medium transition-all
									{minute === m ? 'bg-amber-500 text-white' : 'text-navy-700 hover:bg-navy-50 active:bg-navy-100'}"
							>
								{m}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
