<script lang="ts">
	import { MapPin, ArrowRight, Building2, TowerControl } from 'lucide-svelte';

	const airports = [
		{
			code: 'TPE',
			name: '桃園國際機場',
			city: '桃園市',
			terminals: 2,
			gradient: 'from-teal-500/10 via-teal-400/5 to-transparent',
			accentColor: 'text-teal-600',
			bgAccent: 'bg-teal-500',
			pattern: 'tpe'
		},
		{
			code: 'TSA',
			name: '台北松山機場',
			city: '台北市',
			terminals: 1,
			gradient: 'from-amber-500/10 via-amber-400/5 to-transparent',
			accentColor: 'text-amber-600',
			bgAccent: 'bg-amber-500',
			pattern: 'tsa'
		},
		{
			code: 'KHH',
			name: '高雄國際機場',
			city: '高雄市',
			terminals: 1,
			gradient: 'from-navy-500/10 via-navy-400/5 to-transparent',
			accentColor: 'text-navy-600',
			bgAccent: 'bg-navy-600',
			pattern: 'khh'
		},
		{
			code: 'RMQ',
			name: '台中國際機場',
			city: '台中市',
			terminals: 1,
			gradient: 'from-teal-600/10 via-amber-400/5 to-transparent',
			accentColor: 'text-teal-700',
			bgAccent: 'bg-teal-600',
			pattern: 'rmq'
		}
	] as const;
</script>

<svelte:head>
	<title>機場指南 — AiRoota</title>
	<meta name="description" content="台灣主要機場接機指南，讓每次旅程都從容自在" />
</svelte:head>

<div class="min-h-screen bg-white">
	<!-- Header -->
	<section class="bg-gradient-to-b from-navy-900 via-navy-800 to-navy-700 px-6 pb-10 pt-6">
		<div>
			<div class="flex items-center gap-2.5">
				<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 backdrop-blur-sm">
					<MapPin class="h-5 w-5 text-teal-400" strokeWidth={2.2} />
				</div>
				<h1 class="text-2xl font-bold tracking-tight text-white">機場指南</h1>
			</div>
			<p class="mt-3 text-sm font-medium text-navy-300">
				讓每次旅程都從容自在
			</p>
		</div>
	</section>

	<!-- Airport Cards -->
	<section class="px-5 -mt-4 relative z-10">
		<div class="flex flex-col gap-4">
			{#each airports as airport, i}
				<a
					href="/guides/{airport.code.toLowerCase()}"
					class="group relative overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:border-navy-200 active:scale-[0.98]"
				>
					<!-- Subtle gradient background -->
					<div class="absolute inset-0 bg-gradient-to-r {airport.gradient} opacity-60"></div>

					<!-- Abstract pattern unique per airport -->
					<div class="absolute right-0 top-0 h-full w-28 opacity-[0.04]">
						{#if airport.pattern === 'tpe'}
							<!-- Double terminal pattern -->
							<svg viewBox="0 0 100 100" class="h-full w-full" fill="currentColor">
								<rect x="10" y="15" width="35" height="70" rx="4" />
								<rect x="55" y="15" width="35" height="70" rx="4" />
								<rect x="30" y="35" width="40" height="12" rx="2" />
							</svg>
						{:else if airport.pattern === 'tsa'}
							<!-- City skyline pattern -->
							<svg viewBox="0 0 100 100" class="h-full w-full" fill="currentColor">
								<rect x="10" y="30" width="15" height="55" rx="2" />
								<rect x="30" y="10" width="12" height="75" rx="2" />
								<rect x="48" y="40" width="18" height="45" rx="2" />
								<rect x="72" y="25" width="14" height="60" rx="2" />
							</svg>
						{:else if airport.pattern === 'khh'}
							<!-- Wave/harbor pattern -->
							<svg viewBox="0 0 100 100" class="h-full w-full" fill="currentColor">
								<path d="M0 60 Q25 45 50 60 Q75 75 100 60 L100 100 L0 100Z" />
								<path d="M0 75 Q25 60 50 75 Q75 90 100 75 L100 100 L0 100Z" opacity="0.5" />
							</svg>
						{:else}
							<!-- Mountain pattern -->
							<svg viewBox="0 0 100 100" class="h-full w-full" fill="currentColor">
								<path d="M0 85 L30 35 L55 65 L75 30 L100 85Z" />
								<path d="M0 90 L40 55 L70 75 L100 50 L100 100 L0 100Z" opacity="0.5" />
							</svg>
						{/if}
					</div>

					<div class="relative flex items-center gap-4 px-5 py-5">
						<!-- Airport code badge -->
						<div class="flex flex-col items-center">
							<div class="flex h-14 w-14 items-center justify-center rounded-xl {airport.bgAccent}/10">
								<span class="text-lg font-extrabold tracking-wide {airport.accentColor}">
									{airport.code}
								</span>
							</div>
						</div>

						<!-- Airport info -->
						<div class="flex-1 min-w-0">
							<h2 class="text-[15px] font-bold text-navy-900 leading-snug">
								{airport.name}
							</h2>
							<div class="mt-1 flex items-center gap-3">
								<span class="text-xs text-navy-400">{airport.city}</span>
								<span class="flex items-center gap-1 text-xs text-navy-400">
									{#if airport.terminals > 1}
										<Building2 class="h-3 w-3" strokeWidth={2} />
										{airport.terminals} 航廈
									{:else}
										<TowerControl class="h-3 w-3" strokeWidth={2} />
										{airport.terminals} 航廈
									{/if}
								</span>
							</div>
						</div>

						<!-- Arrow -->
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-navy-50 transition-colors group-hover:bg-navy-100">
							<ArrowRight class="h-4 w-4 text-navy-400 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
						</div>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- Helpful note -->
	<section class="px-6 mt-8">
		<div class="mx-auto rounded-2xl bg-navy-50 px-5 py-4">
			<p class="text-center text-xs leading-relaxed text-navy-500">
				每份指南包含接機位置、入境須知與在地小提醒，<br />
				讓您抵達後輕鬆找到司機。
			</p>
		</div>
	</section>

	<!-- Bottom spacer for tab bar -->
	<div class="pb-28"></div>
</div>
