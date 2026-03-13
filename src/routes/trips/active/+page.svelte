<script lang="ts">
	import {
		currentBooking,
		defaultActiveBooking,
		mockDriver,
		airports,
		vehicles,
		type Booking,
		type BookingState
	} from '$lib/stores/booking';
	import LiveMap from '$lib/components/LiveMap.svelte';
	import {
		ChevronLeft,
		MessageCircle,
		Phone,
		PhoneCall,
		Star,
		Check,
		Plane,
		Car,
		MapPin,
		Clock,
		ArrowRight,
		X,
		Send,
		Info,
		BookOpen,
		ChevronDown,
		ChevronUp,
		DoorOpen,
		Signpost,
		UserCheck,
		Radar,
		Timer
	} from 'lucide-svelte';

	// Demo state — default to en-route (ongoing)
	type DemoState = 'pending' | 'assigned' | 'en-route' | 'in-progress' | 'completed';
	let demoState: DemoState = $state('en-route');

	const demoStates: { key: DemoState; label: string }[] = [
		{ key: 'pending', label: '等待配對' },
		{ key: 'assigned', label: '已配對' },
		{ key: 'en-route', label: '司機出發' },
		{ key: 'in-progress', label: '行程中' },
		{ key: 'completed', label: '已完成' }
	];

	// Use default active booking, or override from store if user just booked
	let booking: Booking = $state({ ...defaultActiveBooking });

	$effect(() => {
		booking.state = demoState;
		if (demoState !== 'pending') {
			booking.driver = mockDriver;
		} else {
			booking.driver = null;
		}
	});

	$effect(() => {
		const unsub = currentBooking.subscribe((v) => {
			if (v) booking = { ...v };
		});
		return unsub;
	});

	let driver = $derived(booking.driver ?? mockDriver);

	// Rating state
	let rating = $state(0);
	let hoverRating = $state(0);
	let tipAmount: number | null = $state(null);
	let customTip = $state('');
	let comment = $state('');
	let submitted = $state(false);

	// Messaging panel
	let showMessaging = $state(false);
	const mockMessages = [
		{ from: 'driver', text: '您好，我已出發前往機場', time: '14:18' },
		{ from: 'driver', text: '預計 12 分鐘後到達', time: '14:19' }
	];

	// Coordinates
	const airportCoords: Record<string, [number, number]> = {
		TPE: [25.0797, 121.2342],
		TSA: [25.0694, 121.5523],
		KHH: [22.5771, 120.3500],
		RMQ: [24.2647, 120.6208]
	};
	const driverPos: [number, number] = [25.0300, 121.4500];
	const destPos: [number, number] = [25.0330, 121.5654];
	let airportPos = $derived(airportCoords[booking.airport.code] ?? airportCoords['TPE']);
	let mapKey = $derived(demoState);

	// Airport guide
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

	let guide = $derived(airportGuides[booking.airport.code] ?? airportGuides['TPE']);
	let guideOpen = $state(false);
	let arrivalOpen = $state(false);

	function selectTip(amount: number) {
		tipAmount = tipAmount === amount ? null : amount;
		customTip = '';
	}
</script>

<svelte:head>
	<title>行程詳情 — Airoota</title>
</svelte:head>

<div class="page-transition flex flex-col">
	<!-- Demo state switcher — compact, bottom-aligned pills -->
	<div class="sticky top-0 z-30 border-b border-navy-100 bg-white/95 px-3 py-2 backdrop-blur-sm">
		<div class="flex items-center justify-between mb-1.5">
			<a href="/trips" class="flex items-center gap-1 text-sm text-navy-500 hover:text-navy-700">
				<ChevronLeft size={16} />
				返回
			</a>
			<span class="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
				展示模式
			</span>
		</div>
		<div class="flex gap-1.5 overflow-x-auto pb-0.5">
			{#each demoStates as ds (ds.key)}
				<button
					onclick={() => { demoState = ds.key; showMessaging = false; submitted = false; }}
					class="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition
						{demoState === ds.key
							? 'bg-navy-900 text-white shadow-md'
							: 'bg-white text-navy-500 hover:bg-navy-100 border border-navy-100'}"
				>
					{ds.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- ===== PENDING ===== -->
	{#if demoState === 'pending'}
		<div class="flex flex-1 flex-col items-center px-5 pt-12">
			<div class="relative mb-8 flex items-center justify-center">
				<div class="absolute h-24 w-24 rounded-full bg-amber-200 animate-pulse-ring"></div>
				<div class="absolute h-16 w-16 rounded-full bg-amber-300 animate-pulse-ring" style="animation-delay: 0.5s;"></div>
				<div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-200">
					<Car size={28} class="text-white" />
				</div>
			</div>

			<h2 class="mb-2 text-xl font-bold text-navy-900">正在為您配對最佳司機</h2>
			<p class="mb-1 text-sm text-navy-500">
				請稍候
				<span class="animate-dot-1">.</span>
				<span class="animate-dot-2">.</span>
				<span class="animate-dot-3">.</span>
			</p>
			<p class="mb-8 text-xs text-navy-400">通常需要 1-3 分鐘</p>

			<!-- Trip summary -->
			<div class="w-full rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
				<h3 class="mb-3 text-xs font-semibold text-navy-400 uppercase tracking-wide">行程摘要</h3>
				<div class="flex items-start gap-3">
					<div class="mt-1 flex flex-col items-center gap-1">
						<div class="h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-100"></div>
						<div class="h-8 w-0.5 bg-navy-200"></div>
						<div class="h-3 w-3 rounded-full border-2 border-teal-500 bg-teal-100"></div>
					</div>
					<div class="flex-1 space-y-3">
						<div>
							<p class="text-xs text-navy-400">接機地點</p>
							<p class="font-medium text-navy-900">{booking.airport.nameZh}</p>
						</div>
						<div>
							<p class="text-xs text-navy-400">目的地</p>
							<p class="font-medium text-navy-900">{booking.address}</p>
						</div>
					</div>
				</div>
				<div class="mt-3 flex items-center justify-between border-t border-navy-50 pt-3 text-sm">
					<span class="flex items-center gap-1.5 text-navy-500">
						<Clock size={14} />
						{booking.date} &middot; {booking.time}
					</span>
					<span class="font-semibold text-navy-900">TWD {booking.price.toLocaleString()}</span>
				</div>
			</div>

			<!-- Airport guide for pending state too -->
			{#if booking.tripType === 'pickup'}
				<div class="w-full mt-4 rounded-2xl border border-teal-200 bg-white shadow-sm overflow-hidden">
					<button onclick={() => (guideOpen = !guideOpen)} class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-teal-50/30">
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
							<BookOpen size={16} class="text-teal-600" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-bold text-navy-900">{booking.airport.nameZh}接機指南</p>
							<p class="text-xs text-navy-400">如何找到您的司機</p>
						</div>
						{#if guideOpen}<ChevronUp size={18} class="text-navy-400" />{:else}<ChevronDown size={18} class="text-navy-400" />{/if}
					</button>
					{#if guideOpen}
						<div class="border-t border-teal-100 px-4 pb-4 pt-3">
							<div class="relative ml-3">
								<div class="absolute left-[13px] top-3 h-[calc(100%-24px)] w-0.5 bg-gradient-to-b from-teal-300 via-teal-200 to-teal-100"></div>
								{#each guide.steps as step, i}
									<div class="relative flex items-start gap-3.5 {i < guide.steps.length - 1 ? 'pb-5' : ''}">
										<div class="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white shadow-sm">{i + 1}</div>
										<div class="pt-0.5">
											<h4 class="text-sm font-bold text-navy-900">{step.title}</h4>
											<p class="mt-0.5 text-xs leading-relaxed text-navy-500">{step.desc}</p>
										</div>
									</div>
								{/each}
							</div>
							<div class="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3">
								<Clock size={16} class="mt-0.5 flex-shrink-0 text-amber-600" />
								<div>
									<p class="text-xs font-semibold text-amber-700">免費等候：國際航班 90 分鐘 / 國內航班 60 分鐘</p>
									<p class="mt-0.5 text-xs text-navy-500">從航班降落時間起算，不需要趕路</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- ===== ASSIGNED ===== -->
	{#if demoState === 'assigned'}
		<div class="flex flex-1 flex-col px-5 pt-5">
			<!-- Success banner -->
			<div class="mb-4 flex items-center gap-3 rounded-xl bg-teal-50 p-3.5">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500">
					<Check size={20} class="text-white" />
				</div>
				<div>
					<p class="font-semibold text-teal-800">司機已配對成功！</p>
					<p class="text-xs text-teal-600">您的司機正準備出發</p>
				</div>
			</div>

			<!-- Pre-trip notification -->
			<div class="mb-4 flex items-start gap-3 rounded-xl bg-teal-50 border border-teal-200 p-3.5">
				<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 mt-0.5">
					<Info size={16} class="text-teal-600" />
				</div>
				<p class="text-sm text-teal-800 leading-relaxed">
					您的航班預計 {booking.time} 抵達，司機將提前到達機場等候
				</p>
			</div>

			<!-- Driver card -->
			<div class="mb-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
				<div class="flex items-center gap-4">
					<div class="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-full bg-navy-900 text-2xl font-bold text-white">陳</div>
					<div class="flex-1">
						<h3 class="text-lg font-bold text-navy-900">{driver.name}</h3>
						<div class="mt-0.5 flex items-center gap-1.5">
							<Star size={14} class="fill-amber-500 text-amber-500" />
							<span class="text-sm font-medium text-navy-700">{driver.rating}</span>
							<span class="text-xs text-navy-400">({driver.trips.toLocaleString()} 趟)</span>
						</div>
					</div>
				</div>
				<div class="mt-4 flex items-center gap-3 rounded-xl bg-navy-50 p-3">
					<Car size={20} class="text-navy-500" />
					<div class="flex-1">
						<p class="text-sm font-medium text-navy-800">{driver.vehicleColor} {driver.vehicle}</p>
						<p class="text-xs text-navy-500">車牌: {driver.plateNumber}</p>
					</div>
				</div>
				<div class="mt-4 flex gap-3">
					<button class="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-navy-200 py-3 text-sm font-semibold text-navy-700 transition hover:bg-navy-50 active:scale-[0.98]">
						<MessageCircle size={18} /> 傳送訊息
					</button>
					<button class="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-teal-200 bg-teal-50 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 active:scale-[0.98]">
						<Phone size={18} /> 撥打電話
					</button>
				</div>
			</div>

			<!-- Flight status -->
			{#if booking.flightNumber}
				<div class="mb-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50">
							<Plane size={18} class="text-navy-600" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium text-navy-800">航班 {booking.flightNumber}</p>
							<div class="mt-0.5 flex items-center gap-1.5">
								<div class="h-2 w-2 rounded-full bg-teal-500"></div>
								<span class="text-xs font-medium text-teal-600">準時</span>
							</div>
						</div>
						<span class="text-xs text-navy-400">{booking.time} 抵達</span>
					</div>
				</div>
			{/if}

			<!-- Airport guide -->
			{#if booking.tripType === 'pickup'}
				<div class="mb-4 rounded-2xl border border-teal-200 bg-white shadow-sm overflow-hidden">
					<button onclick={() => (guideOpen = !guideOpen)} class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-teal-50/30">
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
							<BookOpen size={16} class="text-teal-600" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-bold text-navy-900">{booking.airport.nameZh}接機指南</p>
							<p class="text-xs text-navy-400">如何找到您的司機</p>
						</div>
						{#if guideOpen}<ChevronUp size={18} class="text-navy-400" />{:else}<ChevronDown size={18} class="text-navy-400" />{/if}
					</button>
					{#if guideOpen}
						<div class="border-t border-teal-100 px-4 pb-4 pt-3">
							<div class="relative ml-3">
								<div class="absolute left-[13px] top-3 h-[calc(100%-24px)] w-0.5 bg-gradient-to-b from-teal-300 via-teal-200 to-teal-100"></div>
								{#each guide.steps as step, i}
									<div class="relative flex items-start gap-3.5 {i < guide.steps.length - 1 ? 'pb-5' : ''}">
										<div class="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white shadow-sm">{i + 1}</div>
										<div class="pt-0.5">
											<h4 class="text-sm font-bold text-navy-900">{step.title}</h4>
											<p class="mt-0.5 text-xs leading-relaxed text-navy-500">{step.desc}</p>
										</div>
									</div>
								{/each}
							</div>
							<div class="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3">
								<Clock size={16} class="mt-0.5 flex-shrink-0 text-amber-600" />
								<div>
									<p class="text-xs font-semibold text-amber-700">免費等候：國際航班 90 分鐘 / 國內航班 60 分鐘</p>
									<p class="mt-0.5 text-xs text-navy-500">從航班降落時間起算，不需要趕路</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Trip summary -->
			<div class="rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
				<h3 class="mb-3 text-xs font-semibold text-navy-400 uppercase tracking-wide">行程摘要</h3>
				<div class="flex items-start gap-3">
					<div class="mt-1 flex flex-col items-center gap-1">
						<div class="h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-100"></div>
						<div class="h-8 w-0.5 bg-navy-200"></div>
						<div class="h-3 w-3 rounded-full border-2 border-teal-500 bg-teal-100"></div>
					</div>
					<div class="flex-1 space-y-3">
						<div>
							<p class="text-xs text-navy-400">接機地點</p>
							<p class="font-medium text-navy-900">{booking.airport.nameZh}</p>
						</div>
						<div>
							<p class="text-xs text-navy-400">目的地</p>
							<p class="font-medium text-navy-900">{booking.address}</p>
						</div>
					</div>
				</div>
				<div class="mt-3 flex items-center justify-between border-t border-navy-50 pt-3 text-sm">
					<span class="flex items-center gap-1.5 text-navy-500">
						<Clock size={14} />
						{booking.date} &middot; {booking.time}
					</span>
					<span class="font-semibold text-navy-900">TWD {booking.price.toLocaleString()}</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- ===== EN-ROUTE ===== -->
	{#if demoState === 'en-route'}
		<div class="flex flex-1 flex-col">
			<!-- Live map: driver heading to airport -->
			<div class="relative w-full" style="height: 50vh; min-height: 280px;">
				{#key mapKey}
					<LiveMap
						driverLat={driverPos[0]}
						driverLng={driverPos[1]}
						destLat={airportPos[0]}
						destLng={airportPos[1]}
						driverLabel="司機"
						destLabel={booking.airport.code}
						routeColor="#f0b429"
						driverProgress={0.15}
					/>
				{/key}

				<!-- Floating action buttons -->
				<div class="absolute bottom-20 right-4 z-[500] flex flex-col gap-3">
					<button
						onclick={() => (showMessaging = true)}
						class="flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-white shadow-lg transition hover:bg-navy-800 active:scale-95"
						aria-label="傳送訊息"
					>
						<MessageCircle size={20} />
					</button>
					<button
						class="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg transition hover:bg-teal-600 active:scale-95"
						aria-label="撥打電話"
					>
						<Phone size={20} />
					</button>
				</div>

				<!-- ETA overlay -->
				<div class="absolute bottom-0 left-0 right-0 z-[400] bg-gradient-to-t from-white via-white/95 to-transparent px-5 pb-4 pt-8">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs text-navy-400">預計到達時間</p>
							<p class="text-xl font-bold text-navy-900">您的司機距離 <span class="text-amber-500">12 分鐘</span></p>
						</div>
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-navy-900">
							<Car size={22} class="text-white" />
						</div>
					</div>
				</div>
			</div>

			<!-- Compact driver card -->
			<div class="px-5 py-3">
				<div class="flex items-center gap-3 rounded-xl border border-navy-100 bg-white p-3 shadow-sm">
					<div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-navy-900 text-lg font-bold text-white">陳</div>
					<div class="flex-1">
						<p class="font-semibold text-navy-900">{driver.name}</p>
						<p class="text-xs text-navy-500">{driver.vehicleColor} {driver.vehicle} &middot; {driver.plateNumber}</p>
					</div>
					<button onclick={() => (showMessaging = true)} class="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-600 transition hover:bg-navy-100" aria-label="傳送訊息">
						<MessageCircle size={18} />
					</button>
					<button class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition hover:bg-teal-100" aria-label="撥打電話">
						<Phone size={18} />
					</button>
				</div>
			</div>

			<!-- Airport guide below map -->
			{#if booking.tripType === 'pickup'}
				<div class="px-5 pb-4">
					<div class="rounded-2xl border border-teal-200 bg-white shadow-sm overflow-hidden">
						<button onclick={() => (guideOpen = !guideOpen)} class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-teal-50/30">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
								<BookOpen size={16} class="text-teal-600" />
							</div>
							<div class="flex-1">
								<p class="text-sm font-bold text-navy-900">{booking.airport.nameZh}接機指南</p>
								<p class="text-xs text-navy-400">如何找到您的司機</p>
							</div>
							{#if guideOpen}<ChevronUp size={18} class="text-navy-400" />{:else}<ChevronDown size={18} class="text-navy-400" />{/if}
						</button>
						{#if guideOpen}
							<div class="border-t border-teal-100 px-4 pb-4 pt-3">
								<div class="relative ml-3">
									<div class="absolute left-[13px] top-3 h-[calc(100%-24px)] w-0.5 bg-gradient-to-b from-teal-300 via-teal-200 to-teal-100"></div>
									{#each guide.steps as step, i}
										<div class="relative flex items-start gap-3.5 {i < guide.steps.length - 1 ? 'pb-5' : ''}">
											<div class="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white shadow-sm">{i + 1}</div>
											<div class="pt-0.5">
												<h4 class="text-sm font-bold text-navy-900">{step.title}</h4>
												<p class="mt-0.5 text-xs leading-relaxed text-navy-500">{step.desc}</p>
											</div>
										</div>
									{/each}
								</div>
								<div class="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3">
									<Clock size={16} class="mt-0.5 flex-shrink-0 text-amber-600" />
									<div>
										<p class="text-xs font-semibold text-amber-700">免費等候：國際航班 90 分鐘 / 國內航班 60 分鐘</p>
										<p class="mt-0.5 text-xs text-navy-500">從航班降落時間起算，不需要趕路</p>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Messaging panel -->
		{#if showMessaging}
			<button class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onclick={() => (showMessaging = false)} aria-label="關閉訊息"></button>
			<div class="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[430px] flex flex-col rounded-t-2xl bg-white shadow-2xl" style="max-height: 60vh;">
				<div class="flex items-center justify-between border-b border-navy-100 px-4 py-3">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">陳</div>
						<div>
							<p class="text-sm font-semibold text-navy-900">{driver.name}</p>
							<p class="text-[11px] text-teal-600">線上</p>
						</div>
					</div>
					<button onclick={() => (showMessaging = false)} class="flex h-8 w-8 items-center justify-center rounded-full text-navy-400 transition hover:bg-navy-50 hover:text-navy-600">
						<X size={18} />
					</button>
				</div>
				<div class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
					{#each mockMessages as msg}
						<div class="flex items-end gap-2">
							<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy-100 text-[10px] font-bold text-navy-600">司</div>
							<div class="bg-navy-50 text-navy-800 max-w-[75%] rounded-2xl px-3.5 py-2.5">
								<p class="text-sm">{msg.text}</p>
								<p class="mt-0.5 text-[10px] text-navy-400">{msg.time}</p>
							</div>
						</div>
					{/each}
				</div>
				<div class="flex items-center gap-2 border-t border-navy-100 px-4 py-3">
					<input type="text" placeholder="輸入訊息..." class="flex-1 rounded-full border border-navy-200 bg-navy-50 px-4 py-2.5 text-sm text-navy-800 placeholder:text-navy-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" disabled />
					<button class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white opacity-50" disabled aria-label="傳送">
						<Send size={16} />
					</button>
				</div>
			</div>
		{/if}
	{/if}

	<!-- ===== IN-PROGRESS ===== -->
	{#if demoState === 'in-progress'}
		<div class="flex flex-1 flex-col">
			<!-- Live map: airport to destination -->
			<div class="relative w-full" style="height: 55vh; min-height: 320px;">
				{#key mapKey}
					<LiveMap
						driverLat={airportPos[0]}
						driverLng={airportPos[1]}
						destLat={destPos[0]}
						destLng={destPos[1]}
						driverLabel={booking.airport.code}
						destLabel="目的地"
						routeColor="#27ab83"
						driverProgress={0.35}
					/>
				{/key}

				<!-- ETA overlay -->
				<div class="absolute bottom-0 left-0 right-0 z-[400] bg-gradient-to-t from-white via-white/95 to-transparent px-5 pb-4 pt-8">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs text-navy-400">行程中</p>
							<p class="text-xl font-bold text-navy-900">預計 <span class="text-teal-500">35 分鐘</span> 抵達目的地</p>
						</div>
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500">
							<MapPin size={22} class="text-white" />
						</div>
					</div>
				</div>
			</div>

			<!-- Driver card + support -->
			<div class="px-5 py-3">
				<div class="mb-3 flex items-center gap-3 rounded-xl border border-navy-100 bg-white p-3 shadow-sm">
					<div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-navy-900 text-lg font-bold text-white">陳</div>
					<div class="flex-1">
						<p class="font-semibold text-navy-900">{driver.name}</p>
						<p class="text-xs text-navy-500">{driver.vehicleColor} {driver.vehicle} &middot; {driver.plateNumber}</p>
					</div>
					<button class="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-600 transition hover:bg-navy-100" aria-label="傳送訊息">
						<MessageCircle size={18} />
					</button>
				</div>
				<button class="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-50 py-3 text-sm text-navy-500 transition hover:bg-navy-100">
					<PhoneCall size={16} /> 需要協助？
				</button>
			</div>
		</div>
	{/if}

	<!-- ===== COMPLETED ===== -->
	{#if demoState === 'completed'}
		<div class="flex flex-1 flex-col px-5 pt-8">
			{#if !submitted}
				<div class="mb-6 flex flex-col items-center text-center">
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 shadow-lg shadow-teal-200">
						<Check size={32} class="text-white" />
					</div>
					<h2 class="text-2xl font-bold text-navy-900">旅程完成！</h2>
					<p class="mt-1 text-sm text-navy-500">感謝您選擇 Airoota</p>
				</div>

				<div class="mb-5 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
					<div class="flex items-start gap-3">
						<div class="mt-1 flex flex-col items-center gap-1">
							<div class="h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-100"></div>
							<div class="h-8 w-0.5 bg-navy-200"></div>
							<div class="h-3 w-3 rounded-full border-2 border-teal-500 bg-teal-100"></div>
						</div>
						<div class="flex-1 space-y-3">
							<div>
								<p class="text-xs text-navy-400">出發</p>
								<p class="font-medium text-navy-900">{booking.airport.nameZh}</p>
							</div>
							<div>
								<p class="text-xs text-navy-400">抵達</p>
								<p class="font-medium text-navy-900">{booking.address}</p>
							</div>
						</div>
					</div>
					<div class="mt-3 flex items-center justify-between border-t border-navy-50 pt-3">
						<span class="flex items-center gap-1 text-sm text-navy-500"><Clock size={14} /> 45 分鐘</span>
						<span class="text-lg font-bold text-navy-900">TWD {booking.price.toLocaleString()}</span>
					</div>
				</div>

				<div class="mb-5 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
					<div class="mb-1 flex items-center gap-3">
						<div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-navy-900 text-lg font-bold text-white">陳</div>
						<div>
							<p class="font-semibold text-navy-900">{driver.name}</p>
							<p class="text-xs text-navy-400">您的旅程司機</p>
						</div>
					</div>
					<p class="mb-3 mt-4 text-center text-sm font-medium text-navy-700">為這趟旅程評分</p>
					<div class="flex items-center justify-center gap-2">
						{#each [1, 2, 3, 4, 5] as star}
							<button class="star-btn" onmouseenter={() => (hoverRating = star)} onmouseleave={() => (hoverRating = 0)} onclick={() => (rating = star)}>
								<Star size={36} class="{(hoverRating || rating) >= star ? 'fill-amber-500 text-amber-500' : 'text-navy-200'} transition-colors" />
							</button>
						{/each}
					</div>
					<textarea bind:value={comment} placeholder="留下您的評語（選填）" class="mt-4 w-full resize-none rounded-xl border border-navy-200 bg-navy-50 p-3 text-sm text-navy-800 placeholder:text-navy-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" rows="3"></textarea>
				</div>

				<div class="mb-5 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
					<h3 class="font-semibold text-navy-900">給司機小費</h3>
					<p class="mb-4 text-xs text-navy-400">小費 100% 歸司機所有</p>
					<div class="flex gap-2">
						{#each [50, 100, 200] as amount}
							<button onclick={() => selectTip(amount)} class="flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition {tipAmount === amount ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-navy-200 text-navy-600 hover:border-navy-300'}">
								TWD {amount}
							</button>
						{/each}
						<div class="flex-1">
							<input type="text" bind:value={customTip} placeholder="自訂" onfocus={() => (tipAmount = null)} class="w-full rounded-xl border-2 border-navy-200 py-2.5 text-center text-sm font-semibold text-navy-600 placeholder:text-navy-400 focus:border-amber-500 focus:outline-none" />
						</div>
					</div>
				</div>

				<button onclick={() => (submitted = true)} class="mb-4 w-full rounded-xl bg-amber-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-200/50 transition hover:bg-amber-600 active:scale-[0.98]">
					提交評價
				</button>
				<a href="/book?type=dropoff" class="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-navy-200 py-3.5 text-sm font-semibold text-navy-700 transition hover:bg-navy-50">
					預訂回程？ <ArrowRight size={16} />
				</a>
			{:else}
				<div class="flex flex-1 flex-col items-center justify-center py-16 text-center">
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 shadow-lg shadow-teal-200">
						<Check size={32} class="text-white" />
					</div>
					<h2 class="mb-2 text-xl font-bold text-navy-900">感謝您的評價！</h2>
					<p class="mb-6 text-sm text-navy-500">您的回饋對司機非常重要</p>
					<a href="/trips" class="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800">返回我的行程</a>
					<a href="/book?type=dropoff" class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-600 transition hover:text-amber-700">
						預訂回程 <ArrowRight size={14} />
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>
