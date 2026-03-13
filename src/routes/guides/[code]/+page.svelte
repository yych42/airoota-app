<script lang="ts">
	import { page } from '$app/state';
	import {
		ArrowLeft,
		ChevronDown,
		ChevronUp,
		DoorOpen,
		Signpost,
		UserCheck,
		Clock,
		Radar,
		Timer,
		Lightbulb,
		MapPin
	} from 'lucide-svelte';

	interface AirportData {
		code: string;
		name: string;
		city: string;
		steps: { icon: typeof DoorOpen; title: string; desc: string }[];
		arrivalNotes: { icon: typeof Clock; text: string }[];
		tips: string[];
	}

	const airportDatabase: Record<string, AirportData> = {
		tpe: {
			code: 'TPE',
			name: '桃園國際機場',
			city: '桃園市',
			steps: [
				{ icon: DoorOpen, title: '出關後往左走', desc: '通過海關與行李提領區後，從入境大廳左側出口離開' },
				{ icon: Signpost, title: '跟隨「接機區 B」指標', desc: '沿途會看到清楚的接機區域指引標示' },
				{ icon: UserCheck, title: '司機將持姓名牌等候', desc: '在接機區 B 等候處，司機會舉著印有您姓名的牌子' }
			],
			arrivalNotes: [
				{ icon: Clock, text: '入境審查通常需要 20-40 分鐘' },
				{ icon: Radar, text: '您的司機會即時追蹤航班，自動調整時間' },
				{ icon: Timer, text: '免費等候時間：國際航班 90 分鐘 / 國內航班 60 分鐘' }
			],
			tips: [
				'💡 桃園機場捷運到台北車站約 35 分鐘，是很好的替代方案',
				'💡 市區的匯率比機場好，建議在機場只換少量現金',
				'💡 推薦下載悠遊付 App，方便搭乘大眾運輸',
				'💡 第二航廈的美食街選擇較多，等機時可以逛逛'
			]
		},
		tsa: {
			code: 'TSA',
			name: '台北松山機場',
			city: '台北市',
			steps: [
				{ icon: DoorOpen, title: '出關後直行', desc: '通過入境大廳後往正前方出口離開' },
				{ icon: Signpost, title: '前往一樓接機大廳', desc: '跟隨「接機」或「Arrivals」指標至一樓大廳' },
				{ icon: UserCheck, title: '司機將持姓名牌等候', desc: '在接機大廳出口處，司機會舉著印有您姓名的牌子' }
			],
			arrivalNotes: [
				{ icon: Clock, text: '入境審查通常需要 15-30 分鐘' },
				{ icon: Radar, text: '您的司機會即時追蹤航班，自動調整時間' },
				{ icon: Timer, text: '免費等候時間：國際航班 90 分鐘 / 國內航班 60 分鐘' }
			],
			tips: [
				'💡 松山機場離市區很近，到台北市中心僅約 15 分鐘車程',
				'💡 機場旁就是捷運文湖線松山機場站，非常方便',
				'💡 松山機場規模較小，出關速度通常很快',
				'💡 機場附近的民生社區有許多在地美食值得一試'
			]
		},
		khh: {
			code: 'KHH',
			name: '高雄國際機場',
			city: '高雄市',
			steps: [
				{ icon: DoorOpen, title: '出關後往右走', desc: '通過入境大廳後從右側出口離開' },
				{ icon: Signpost, title: '前往國際航廈接機區', desc: '跟隨接機區域指標前往一樓接機大廳' },
				{ icon: UserCheck, title: '司機將持姓名牌等候', desc: '在接機大廳門口，司機會舉著印有您姓名的牌子' }
			],
			arrivalNotes: [
				{ icon: Clock, text: '入境審查通常需要 15-25 分鐘' },
				{ icon: Radar, text: '您的司機會即時追蹤航班，自動調整時間' },
				{ icon: Timer, text: '免費等候時間：國際航班 90 分鐘 / 國內航班 60 分鐘' }
			],
			tips: [
				'💡 高雄機場到市區只要約 20 分鐘車程，非常近',
				'💡 機場直接連接捷運紅線，交通十分便利',
				'💡 到六合夜市或瑞豐夜市約 20-30 分鐘車程',
				'💡 高雄天氣較熱，建議準備輕便衣物和防曬用品'
			]
		},
		rmq: {
			code: 'RMQ',
			name: '台中國際機場',
			city: '台中市',
			steps: [
				{ icon: DoorOpen, title: '出關後直行', desc: '通過入境大廳後從正前方出口離開' },
				{ icon: Signpost, title: '前往一樓接機區', desc: '跟隨接機區指標前往一樓大廳出口' },
				{ icon: UserCheck, title: '司機將持姓名牌等候', desc: '在航廈出口處，司機會舉著印有您姓名的牌子' }
			],
			arrivalNotes: [
				{ icon: Clock, text: '入境審查通常需要 10-20 分鐘' },
				{ icon: Radar, text: '您的司機會即時追蹤航班，自動調整時間' },
				{ icon: Timer, text: '免費等候時間：國際航班 90 分鐘 / 國內航班 60 分鐘' }
			],
			tips: [
				'💡 台中機場到市區約 30 分鐘車程',
				'💡 機場規模較小，出關速度通常很快',
				'💡 逢甲夜市和一中街商圈是台中必訪景點',
				'💡 台中的公車 10 公里以內免費，善加利用非常划算'
			]
		}
	};

	const code = $derived(page.params.code?.toLowerCase() ?? 'tpe');
	const airport = $derived(airportDatabase[code] ?? airportDatabase['tpe']);

	let openSections = $state<Record<string, boolean>>({
		meetDriver: true,
		arrivalInfo: false,
		localTips: false
	});

	function toggleSection(key: string) {
		openSections[key] = !openSections[key];
	}
</script>

<svelte:head>
	<title>{airport.name} 指南 — Airoota</title>
	<meta name="description" content="{airport.name}接機指南，找到您的司機" />
</svelte:head>

<div class="min-h-screen bg-white">
	<!-- Top bar -->
	<header class="sticky top-0 z-30 border-b border-navy-100/60 bg-white/95 backdrop-blur-md">
		<div class="flex items-center gap-3 px-4 py-3">
			<a
				href="/trips"
				class="flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 transition-colors hover:bg-navy-100 active:scale-95"
			>
				<ArrowLeft class="h-4.5 w-4.5 text-navy-600" strokeWidth={2.5} />
			</a>
			<div class="flex items-center gap-2">
				<span class="text-sm font-extrabold tracking-wide text-teal-600">{airport.code}</span>
				<span class="text-sm font-semibold text-navy-900">{airport.name}</span>
			</div>
		</div>
	</header>

	<!-- Airport hero bar -->
	<section class="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-700 px-6 py-6">
		<div class="flex items-center gap-4">
			<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/15 backdrop-blur-sm">
				<span class="text-xl font-black tracking-wider text-teal-400">{airport.code}</span>
			</div>
			<div>
				<h1 class="text-lg font-bold text-white">{airport.name}</h1>
				<p class="mt-0.5 flex items-center gap-1.5 text-sm text-navy-300">
					<MapPin class="h-3.5 w-3.5" strokeWidth={2} />
					{airport.city}
				</p>
			</div>
		</div>
	</section>

	<!-- Expandable Sections -->
	<div class="px-5 py-5 space-y-4">

		<!-- Section A: Where to meet your driver -->
		<div class="rounded-2xl border border-navy-100/80 bg-white shadow-sm overflow-hidden">
			<button
				onclick={() => toggleSection('meetDriver')}
				class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-navy-50/50"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
						<UserCheck class="h-4 w-4 text-teal-600" strokeWidth={2.2} />
					</div>
					<span class="text-[15px] font-bold text-navy-900">在哪裡見到您的司機</span>
				</div>
				{#if openSections['meetDriver']}
					<ChevronUp class="h-5 w-5 text-navy-400" strokeWidth={2} />
				{:else}
					<ChevronDown class="h-5 w-5 text-navy-400" strokeWidth={2} />
				{/if}
			</button>

			{#if openSections['meetDriver']}
				<div class="px-5 pb-5">
					<!-- SVG pickup guide illustration -->
					<div class="mb-5 rounded-xl bg-navy-50 px-4 py-5">
						<svg viewBox="0 0 300 60" class="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
							<!-- Dotted connecting line -->
							<line x1="50" y1="30" x2="250" y2="30" stroke="#27ab83" stroke-width="2" stroke-dasharray="6 4" stroke-linecap="round" opacity="0.5" />

							<!-- Step 1 circle -->
							<circle cx="50" cy="30" r="16" fill="#27ab83" opacity="0.12" />
							<circle cx="50" cy="30" r="12" fill="#27ab83" />
							<text x="50" y="35" text-anchor="middle" fill="white" font-size="12" font-weight="700">1</text>

							<!-- Step 2 circle -->
							<circle cx="150" cy="30" r="16" fill="#f0b429" opacity="0.12" />
							<circle cx="150" cy="30" r="12" fill="#f0b429" />
							<text x="150" y="35" text-anchor="middle" fill="#102a43" font-size="12" font-weight="700">2</text>

							<!-- Step 3 circle -->
							<circle cx="250" cy="30" r="16" fill="#27ab83" opacity="0.12" />
							<circle cx="250" cy="30" r="12" fill="#27ab83" />
							<text x="250" y="35" text-anchor="middle" fill="white" font-size="12" font-weight="700">3</text>

							<!-- Labels -->
							<text x="50" y="56" text-anchor="middle" fill="#627d98" font-size="8" font-weight="500">出關</text>
							<text x="150" y="56" text-anchor="middle" fill="#627d98" font-size="8" font-weight="500">指標</text>
							<text x="250" y="56" text-anchor="middle" fill="#627d98" font-size="8" font-weight="500">會合</text>
						</svg>
					</div>

					<!-- Step cards -->
					<div class="relative ml-4">
						<!-- Vertical connecting line -->
						<div class="absolute left-[14px] top-4 h-[calc(100%-32px)] w-0.5 bg-gradient-to-b from-teal-300 via-teal-200 to-teal-100"></div>

						{#each airport.steps as step, i}
							<div class="relative flex items-start gap-4 {i < airport.steps.length - 1 ? 'pb-6' : ''}">
								<div class="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white shadow-md shadow-teal-500/25">
									{i + 1}
								</div>
								<div class="pt-0.5">
									<div class="flex items-center gap-2">
										<step.icon class="h-4 w-4 text-teal-600" strokeWidth={2} />
										<h4 class="text-sm font-bold text-navy-900">{step.title}</h4>
									</div>
									<p class="mt-1 text-xs leading-relaxed text-navy-500">{step.desc}</p>
								</div>
							</div>
						{/each}
					</div>

					<!-- Free wait time banner -->
					<div class="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-4">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
							<Clock class="h-4 w-4 text-amber-600" strokeWidth={2.2} />
						</div>
						<div>
							<p class="text-sm font-semibold text-amber-600">
								免費等候時間：國際航班 90 分鐘，國內航班 60 分鐘
							</p>
							<p class="mt-1 text-xs leading-relaxed text-navy-600">
								從航班實際降落時間起算。您不需要趕路，我們的司機會耐心等候。
							</p>
						</div>
					</div>

					<!-- Reassurance message -->
					<div class="mt-3 rounded-xl bg-teal-50 px-4 py-3">
						<p class="text-center text-xs font-medium leading-relaxed text-teal-700">
							不用擔心，司機會耐心等候您
						</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Section B: What to expect -->
		<div class="rounded-2xl border border-navy-100/80 bg-white shadow-sm overflow-hidden">
			<button
				onclick={() => toggleSection('arrivalInfo')}
				class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-navy-50/50"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
						<Clock class="h-4 w-4 text-amber-600" strokeWidth={2.2} />
					</div>
					<span class="text-[15px] font-bold text-navy-900">抵達須知</span>
				</div>
				{#if openSections['arrivalInfo']}
					<ChevronUp class="h-5 w-5 text-navy-400" strokeWidth={2} />
				{:else}
					<ChevronDown class="h-5 w-5 text-navy-400" strokeWidth={2} />
				{/if}
			</button>

			{#if openSections['arrivalInfo']}
				<div class="px-5 pb-5 space-y-3">
					{#each airport.arrivalNotes as note}
						<div class="flex items-start gap-3 rounded-xl bg-navy-50 px-4 py-3.5">
							<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
								<note.icon class="h-4 w-4 text-navy-600" strokeWidth={2} />
							</div>
							<p class="pt-1 text-sm leading-relaxed text-navy-700">{note.text}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Section C: Local tips from your driver -->
		<div class="rounded-2xl border border-navy-100/80 bg-white shadow-sm overflow-hidden">
			<button
				onclick={() => toggleSection('localTips')}
				class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-navy-50/50"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100">
						<Lightbulb class="h-4 w-4 text-navy-600" strokeWidth={2.2} />
					</div>
					<span class="text-[15px] font-bold text-navy-900">司機的在地小提醒</span>
				</div>
				{#if openSections['localTips']}
					<ChevronUp class="h-5 w-5 text-navy-400" strokeWidth={2} />
				{:else}
					<ChevronDown class="h-5 w-5 text-navy-400" strokeWidth={2} />
				{/if}
			</button>

			{#if openSections['localTips']}
				<div class="px-5 pb-5 space-y-3">
					{#each airport.tips as tip}
						<div class="rounded-xl bg-amber-50/70 px-4 py-3.5">
							<p class="text-sm leading-relaxed text-navy-700">{tip}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>

	</div>

	<!-- Bottom spacer for tab bar -->
	<div class="pb-28"></div>
</div>
