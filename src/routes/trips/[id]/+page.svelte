<script lang="ts">
	import { page } from '$app/state';
	import { pastBookings, upcomingBookings, type Booking } from '$lib/stores/booking';
	import {
		ChevronLeft,
		ChevronDown,
		ChevronUp,
		Clock,
		MapPin,
		Star,
		Car,
		Receipt,
		Download,
		ArrowRight,
		Plane,
		User,
		BookOpen,
		DoorOpen,
		Signpost,
		UserCheck,
		Radar,
		Timer
	} from 'lucide-svelte';

	let past: Booking[] = $state([]);
	let upcoming: Booking[] = $state([]);

	$effect(() => {
		const unsub1 = pastBookings.subscribe((v) => (past = v));
		const unsub2 = upcomingBookings.subscribe((v) => (upcoming = v));
		return () => { unsub1(); unsub2(); };
	});

	let tripId = $derived(page.params.id);
	let trip = $derived(
		past.find((t) => t.id === tripId) ??
		upcoming.find((t) => t.id === tripId) ??
		null
	);
	let isUpcoming = $derived(trip ? trip.state !== 'completed' : false);

	function formatDateFull(dateStr: string): string {
		const d = new Date(dateStr);
		return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
	}

	// Mock receipt data
	let baseFare = $derived(trip ? Math.round(trip.price * 0.85) : 0);
	let tollFee = $derived(trip ? Math.round(trip.price * 0.08) : 0);
	let serviceFee = $derived(trip ? trip.price - baseFare - tollFee : 0);

	// Airport guide data
	interface GuideData {
		steps: { icon: typeof DoorOpen; title: string; desc: string }[];
		arrivalNotes: { icon: typeof Clock; text: string }[];
	}

	const airportGuides: Record<string, GuideData> = {
		TPE: {
			steps: [
				{ icon: DoorOpen, title: '出關後往左走', desc: '通過海關與行李提領區後，從入境大廳左側出口離開' },
				{ icon: Signpost, title: '跟隨「接機區 B」指標', desc: '沿途會看到清楚的接機區域指引標示' },
				{ icon: UserCheck, title: '司機將持姓名牌等候', desc: '在接機區 B 等候處，司機會舉著印有您姓名的牌子' }
			],
			arrivalNotes: [
				{ icon: Clock, text: '入境審查通常需要 20-40 分鐘' },
				{ icon: Radar, text: '您的司機會即時追蹤航班，自動調整時間' },
				{ icon: Timer, text: '免費等候：國際航班 90 分鐘 / 國內航班 60 分鐘' }
			]
		},
		TSA: {
			steps: [
				{ icon: DoorOpen, title: '出關後直行', desc: '通過入境大廳後往正前方出口離開' },
				{ icon: Signpost, title: '前往一樓接機大廳', desc: '跟隨「接機」指標至一樓大廳' },
				{ icon: UserCheck, title: '司機將持姓名牌等候', desc: '在接機大廳出口處，司機會舉著印有您姓名的牌子' }
			],
			arrivalNotes: [
				{ icon: Clock, text: '入境審查通常需要 15-30 分鐘' },
				{ icon: Radar, text: '您的司機會即時追蹤航班，自動調整時間' },
				{ icon: Timer, text: '免費等候：國際航班 90 分鐘 / 國內航班 60 分鐘' }
			]
		},
		KHH: {
			steps: [
				{ icon: DoorOpen, title: '出關後往右走', desc: '通過入境大廳後從右側出口離開' },
				{ icon: Signpost, title: '前往國際航廈接機區', desc: '跟隨接機區域指標前往一樓接機大廳' },
				{ icon: UserCheck, title: '司機將持姓名牌等候', desc: '在接機大廳門口，司機會舉著印有您姓名的牌子' }
			],
			arrivalNotes: [
				{ icon: Clock, text: '入境審查通常需要 15-25 分鐘' },
				{ icon: Radar, text: '您的司機會即時追蹤航班，自動調整時間' },
				{ icon: Timer, text: '免費等候：國際航班 90 分鐘 / 國內航班 60 分鐘' }
			]
		},
		RMQ: {
			steps: [
				{ icon: DoorOpen, title: '出關後直行', desc: '通過入境大廳後從正前方出口離開' },
				{ icon: Signpost, title: '前往一樓接機區', desc: '跟隨接機區指標前往一樓大廳出口' },
				{ icon: UserCheck, title: '司機將持姓名牌等候', desc: '在航廈出口處，司機會舉著印有您姓名的牌子' }
			],
			arrivalNotes: [
				{ icon: Clock, text: '入境審查通常需要 10-20 分鐘' },
				{ icon: Radar, text: '您的司機會即時追蹤航班，自動調整時間' },
				{ icon: Timer, text: '免費等候：國際航班 90 分鐘 / 國內航班 60 分鐘' }
			]
		}
	};

	let guide = $derived(trip ? airportGuides[trip.airport.code] ?? airportGuides['TPE'] : null);

	// Collapsible sections
	let guideOpen = $state(false);
	let arrivalOpen = $state(false);
</script>

<svelte:head>
	<title>{trip ? `行程 ${trip.airport.code}` : '行程詳情'} — Airoota</title>
</svelte:head>

<div class="page-transition flex flex-col pb-8">
	<!-- Header -->
	<div class="sticky top-0 z-20 flex items-center gap-3 border-b border-navy-100 bg-white/95 px-4 py-3 backdrop-blur-sm">
		<a href="/trips" class="flex items-center gap-1 text-sm text-navy-500 hover:text-navy-700">
			<ChevronLeft size={18} />
			返回
		</a>
		<h1 class="text-base font-semibold text-navy-900">行程詳情</h1>
	</div>

	{#if !trip}
		<div class="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
			<div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-100">
				<MapPin size={24} class="text-navy-400" />
			</div>
			<h2 class="mb-2 text-lg font-semibold text-navy-800">找不到此行程</h2>
			<p class="mb-6 text-sm text-navy-400">此行程可能已移除或不存在</p>
			<a
				href="/trips"
				class="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
			>
				返回我的行程
			</a>
		</div>
	{:else}
		<div class="px-5 pt-5">
			<!-- Trip type badge -->
			{#if isUpcoming}
				<div class="mb-4 flex items-center gap-2">
					<span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">即將到來</span>
					<span class="text-xs text-navy-400">{formatDateFull(trip.date)}</span>
				</div>
			{/if}

			<!-- Trip summary header -->
			<div class="mb-5 text-center">
				<div class="mb-2 flex items-center justify-center gap-3">
					<span class="text-2xl font-bold text-navy-900">{trip.airport.code}</span>
					<div class="flex items-center gap-1 text-navy-300">
						<div class="h-0.5 w-6 bg-navy-200"></div>
						<Plane size={16} class="text-amber-500" />
						<div class="h-0.5 w-6 bg-navy-200"></div>
					</div>
					<span class="text-lg font-bold text-navy-900">目的地</span>
				</div>
				<p class="text-sm text-navy-500">{trip.airport.nameZh} &rarr; {trip.address}</p>
			</div>

			<!-- Date, time, price grid -->
			<div class="mb-5 grid grid-cols-3 gap-3">
				<div class="flex flex-col items-center rounded-xl bg-navy-50 px-3 py-3">
					<Clock size={16} class="mb-1 text-navy-400" />
					<span class="text-xs text-navy-400">日期</span>
					<span class="text-sm font-semibold text-navy-800">
						{(new Date(trip.date)).getMonth() + 1}/{(new Date(trip.date)).getDate()}
					</span>
				</div>
				<div class="flex flex-col items-center rounded-xl bg-navy-50 px-3 py-3">
					<MapPin size={16} class="mb-1 text-navy-400" />
					<span class="text-xs text-navy-400">時間</span>
					<span class="text-sm font-semibold text-navy-800">{trip.time}</span>
					{#if !isUpcoming}
						<span class="text-xs text-navy-600">45 分鐘</span>
					{/if}
				</div>
				<div class="flex flex-col items-center rounded-xl bg-amber-50 px-3 py-3">
					<Receipt size={16} class="mb-1 text-amber-500" />
					<span class="text-xs text-amber-600">費用</span>
					<span class="text-sm font-bold text-amber-800">TWD {trip.price.toLocaleString()}</span>
				</div>
			</div>

			<!-- Driver card -->
			{#if trip.driver}
				<div class="mb-5 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
					<h3 class="mb-3 text-xs font-semibold text-navy-400 uppercase tracking-wide">司機資訊</h3>
					<div class="flex items-center gap-4">
						<div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-navy-900 text-xl font-bold text-white">
							{trip.driver.name.charAt(0)}
						</div>
						<div class="flex-1">
							<h4 class="text-lg font-bold text-navy-900">{trip.driver.name}</h4>
							<div class="mt-0.5 flex items-center gap-1.5">
								<Star size={14} class="fill-amber-500 text-amber-500" />
								<span class="text-sm font-medium text-navy-700">{trip.driver.rating}</span>
								<span class="text-xs text-navy-400">({trip.driver.trips.toLocaleString()} 趟)</span>
							</div>
						</div>
					</div>
					<div class="mt-3 flex items-center gap-3 rounded-xl bg-navy-50 p-3">
						<Car size={18} class="text-navy-500" />
						<div class="flex-1">
							<p class="text-sm font-medium text-navy-800">{trip.driver.vehicleColor} {trip.driver.vehicle}</p>
							<p class="text-xs text-navy-500">車牌: {trip.driver.plateNumber}</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- ===== AIRPORT GUIDE (tied to this trip) ===== -->
			{#if trip.tripType === 'pickup' && guide}
				<div class="mb-5 rounded-2xl border border-teal-200 bg-white shadow-sm overflow-hidden">
					<!-- Pickup guide -->
					<button
						onclick={() => (guideOpen = !guideOpen)}
						class="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-teal-50/30"
					>
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
							<BookOpen size={16} class="text-teal-600" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-bold text-navy-900">
								{trip.airport.nameZh}接機指南
							</p>
							<p class="text-xs text-navy-400">如何找到您的司機</p>
						</div>
						{#if guideOpen}
							<ChevronUp size={18} class="text-navy-400" />
						{:else}
							<ChevronDown size={18} class="text-navy-400" />
						{/if}
					</button>

					{#if guideOpen}
						<div class="border-t border-teal-100 px-4 pb-4 pt-3">
							<!-- Steps -->
							<div class="relative ml-3">
								<div class="absolute left-[13px] top-3 h-[calc(100%-24px)] w-0.5 bg-gradient-to-b from-teal-300 via-teal-200 to-teal-100"></div>

								{#each guide.steps as step, i}
									<div class="relative flex items-start gap-3.5 {i < guide.steps.length - 1 ? 'pb-5' : ''}">
										<div class="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white shadow-sm">
											{i + 1}
										</div>
										<div class="pt-0.5">
											<h4 class="text-sm font-bold text-navy-900">{step.title}</h4>
											<p class="mt-0.5 text-xs leading-relaxed text-navy-500">{step.desc}</p>
										</div>
									</div>
								{/each}
							</div>

							<!-- Wait time banner -->
							<div class="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3">
								<Clock size={16} class="mt-0.5 flex-shrink-0 text-amber-600" />
								<div>
									<p class="text-xs font-semibold text-amber-700">免費等候：國際航班 90 分鐘 / 國內航班 60 分鐘</p>
									<p class="mt-0.5 text-xs text-navy-500">從航班降落時間起算，不需要趕路</p>
								</div>
							</div>

							<!-- Reassurance -->
							<div class="mt-3 rounded-xl bg-teal-50 px-3.5 py-2.5 text-center">
								<p class="text-xs font-medium text-teal-700">不用擔心，司機會耐心等候您</p>
							</div>
						</div>
					{/if}
				</div>

				<!-- Arrival info -->
				<div class="mb-5 rounded-2xl border border-navy-100 bg-white shadow-sm overflow-hidden">
					<button
						onclick={() => (arrivalOpen = !arrivalOpen)}
						class="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-navy-50/30"
					>
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
							<Clock size={16} class="text-amber-600" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-bold text-navy-900">抵達須知</p>
							<p class="text-xs text-navy-400">入境與等候時間</p>
						</div>
						{#if arrivalOpen}
							<ChevronUp size={18} class="text-navy-400" />
						{:else}
							<ChevronDown size={18} class="text-navy-400" />
						{/if}
					</button>

					{#if arrivalOpen}
						<div class="space-y-2.5 border-t border-navy-100 px-4 pb-4 pt-3">
							{#each guide.arrivalNotes as note}
								<div class="flex items-start gap-2.5 rounded-xl bg-navy-50 px-3.5 py-3">
									<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
										<note.icon size={14} class="text-navy-600" />
									</div>
									<p class="pt-0.5 text-xs leading-relaxed text-navy-700">{note.text}</p>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Route summary -->
			<div class="mb-5 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
				<h3 class="mb-3 text-xs font-semibold text-navy-400 uppercase tracking-wide">路線摘要</h3>
				<div class="flex items-start gap-3">
					<div class="mt-1 flex flex-col items-center gap-1">
						<div class="h-3.5 w-3.5 rounded-full border-2 border-amber-500 bg-amber-100"></div>
						<div class="h-12 w-0.5 bg-gradient-to-b from-amber-300 to-teal-300"></div>
						<div class="h-3.5 w-3.5 rounded-full border-2 border-teal-500 bg-teal-100"></div>
					</div>
					<div class="flex-1 space-y-4">
						<div>
							<p class="text-xs text-navy-400">
								{trip.tripType === 'pickup' ? '接機地點' : '出發地'}
							</p>
							<p class="font-medium text-navy-900">{trip.tripType === 'pickup' ? trip.airport.nameZh : trip.address}</p>
						</div>
						<div>
							<p class="text-xs text-navy-400">
								{trip.tripType === 'pickup' ? '目的地' : '機場'}
							</p>
							<p class="font-medium text-navy-900">{trip.tripType === 'pickup' ? trip.address : trip.airport.nameZh}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Receipt (only for completed trips) -->
			{#if !isUpcoming}
				<div class="mb-5 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
					<h3 class="mb-3 text-xs font-semibold text-navy-400 uppercase tracking-wide">費用明細</h3>
					<div class="space-y-2.5">
						<div class="flex items-center justify-between text-sm">
							<span class="text-navy-600">基本車資</span>
							<span class="font-medium text-navy-800">TWD {baseFare.toLocaleString()}</span>
						</div>
						<div class="flex items-center justify-between text-sm">
							<span class="text-navy-600">過路費</span>
							<span class="font-medium text-navy-800">TWD {tollFee.toLocaleString()}</span>
						</div>
						<div class="flex items-center justify-between text-sm">
							<span class="text-navy-600">服務費</span>
							<span class="font-medium text-navy-800">TWD {serviceFee.toLocaleString()}</span>
						</div>
						<div class="border-t border-navy-100 pt-2.5">
							<div class="flex items-center justify-between">
								<span class="font-semibold text-navy-900">總計</span>
								<span class="text-lg font-bold text-navy-900">TWD {trip.price.toLocaleString()}</span>
							</div>
						</div>
					</div>
					<button class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-navy-200 py-3 text-sm font-semibold text-navy-700 transition hover:bg-navy-50 active:scale-[0.98]">
						<Download size={16} />
						下載收據
					</button>
				</div>
			{/if}

			<!-- CTA -->
			<a
				href="/book?type={trip.tripType}"
				class="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-200/50 transition hover:bg-amber-600 active:scale-[0.98]"
			>
				{isUpcoming ? '修改行程' : '預訂類似行程'}
				<ArrowRight size={18} />
			</a>
		</div>
	{/if}
</div>
