<script lang="ts">
	import {
		currentBooking,
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
		CircleDot,
		ArrowRight,
		X,
		Send,
		Info
	} from 'lucide-svelte';

	// Demo state management
	type DemoState = 'pending' | 'assigned' | 'en-route' | 'in-progress' | 'completed';

	let demoState: DemoState = $state('pending');

	const demoStates: { key: DemoState; label: string }[] = [
		{ key: 'pending', label: '等待配對' },
		{ key: 'assigned', label: '已配對' },
		{ key: 'en-route', label: '司機出發' },
		{ key: 'in-progress', label: '行程中' },
		{ key: 'completed', label: '已完成' }
	];

	// Mock booking for demo (in case currentBooking is null)
	let booking: Booking = $state({
		id: 'b-active-1',
		tripType: 'pickup',
		airport: airports[0],
		address: '台北市信義區信義路五段7號',
		date: '2026-03-13',
		time: '14:30',
		flightNumber: 'BR872',
		vehicle: vehicles[0],
		price: 1200,
		state: 'pending',
		driver: null,
		paymentMethod: 'credit-card'
	});

	// Sync demo state to booking
	$effect(() => {
		booking.state = demoState;
		if (demoState !== 'pending') {
			booking.driver = mockDriver;
		} else {
			booking.driver = null;
		}
	});

	// Also try reading from the store if available
	$effect(() => {
		const unsub = currentBooking.subscribe((v) => {
			if (v) {
				booking = { ...v };
			}
		});
		return unsub;
	});

	let driver = $derived(booking.driver ?? mockDriver);

	// Rating state
	let rating: number = $state(0);
	let hoverRating: number = $state(0);
	let tipAmount: number | null = $state(null);
	let customTip: string = $state('');
	let comment: string = $state('');
	let submitted: boolean = $state(false);

	// Messaging panel state
	let showMessaging: boolean = $state(false);

	const mockMessages = [
		{ from: 'driver', text: '您好，我已出發前往機場', time: '14:18' },
		{ from: 'driver', text: '預計 12 分鐘後到達', time: '14:19' }
	];

	// Coordinates for Taiwan airports and mock destinations
	const airportCoords: Record<string, [number, number]> = {
		TPE: [25.0797, 121.2342],
		TSA: [25.0694, 121.5523],
		KHH: [22.5771, 120.3500],
		RMQ: [24.2647, 120.6208]
	};
	// Mock driver position (between airport and destination)
	const driverPos: [number, number] = [25.0300, 121.4500];
	// Mock destination (Taipei 101 area)
	const destPos: [number, number] = [25.0330, 121.5654];

	let airportPos = $derived(airportCoords[booking.airport.code] ?? airportCoords['TPE']);

	// Key to force re-mount map when state changes
	let mapKey = $derived(demoState);

	function selectTip(amount: number) {
		tipAmount = tipAmount === amount ? null : amount;
		customTip = '';
	}
</script>

<svelte:head>
	<title>行程詳情 — Airoota</title>
</svelte:head>

<div class="page-transition flex flex-col">
	<!-- Demo controls bar -->
	<div class="sticky top-0 z-30 border-b border-navy-100 bg-navy-50/95 px-3 py-2 backdrop-blur-sm">
		<div class="mb-1.5 flex items-center justify-between">
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
					onclick={() => { demoState = ds.key; showMessaging = false; }}
					class="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition
						{demoState === ds.key
							? 'bg-navy-900 text-white shadow-md'
							: 'bg-white text-navy-500 hover:bg-navy-100'}"
				>
					{ds.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- ===== STATE: PENDING ===== -->
	{#if demoState === 'pending'}
		<div class="flex flex-1 flex-col items-center px-5 pt-12">
			<!-- Pulsing animation -->
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

			<!-- Trip summary card -->
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
		</div>
	{/if}

	<!-- ===== STATE: ASSIGNED ===== -->
	{#if demoState === 'assigned'}
		<div class="flex flex-1 flex-col px-5 pt-6 animate-slide-up">
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

			<!-- Pre-trip notification: flight arrival info -->
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
					<!-- Avatar -->
					<div class="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-full bg-navy-900 text-2xl font-bold text-white">
						陳
					</div>
					<div class="flex-1">
						<h3 class="text-lg font-bold text-navy-900">{driver.name}</h3>
						<div class="mt-0.5 flex items-center gap-1.5">
							<Star size={14} class="fill-amber-500 text-amber-500" />
							<span class="text-sm font-medium text-navy-700">{driver.rating}</span>
							<span class="text-xs text-navy-400">({driver.trips.toLocaleString()} 趟)</span>
						</div>
					</div>
				</div>

				<!-- Vehicle info -->
				<div class="mt-4 flex items-center gap-3 rounded-xl bg-navy-50 p-3">
					<Car size={20} class="text-navy-500" />
					<div class="flex-1">
						<p class="text-sm font-medium text-navy-800">{driver.vehicleColor} {driver.vehicle}</p>
						<p class="text-xs text-navy-500">車牌: {driver.plateNumber}</p>
					</div>
				</div>

				<!-- Message and Call buttons side by side -->
				<div class="mt-4 flex gap-3">
					<button class="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-navy-200 py-3 text-sm font-semibold text-navy-700 transition hover:bg-navy-50 active:scale-[0.98]">
						<MessageCircle size={18} />
						傳送訊息
					</button>
					<button class="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-teal-200 bg-teal-50 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 active:scale-[0.98]">
						<Phone size={18} />
						撥打電話
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

	<!-- ===== STATE: EN-ROUTE ===== -->
	{#if demoState === 'en-route'}
		<div class="flex flex-1 flex-col animate-slide-up">
			<!-- Floating ETA bar at top -->
			<div class="sticky top-[88px] z-20 mx-4 mt-3 flex items-center justify-between rounded-xl bg-navy-900 px-4 py-3 shadow-lg">
				<div class="flex items-center gap-2.5">
					<div class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500">
						<Car size={16} class="text-white" />
					</div>
					<div>
						<p class="text-[11px] text-navy-300">預計到達</p>
						<p class="text-base font-bold text-white"><span class="text-amber-400">12 分鐘</span></p>
					</div>
				</div>
				<div class="flex items-center gap-1.5 text-xs text-navy-300">
					<Clock size={12} />
					<span>14:42 抵達機場</span>
				</div>
			</div>

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
					/>
				{/key}

				<!-- Floating action buttons on the map -->
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

			<!-- Driver card (compact) -->
			<div class="px-5 py-4">
				<div class="flex items-center gap-3 rounded-xl border border-navy-100 bg-white p-3 shadow-sm">
					<div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-navy-900 text-lg font-bold text-white">
						陳
					</div>
					<div class="flex-1">
						<p class="font-semibold text-navy-900">{driver.name}</p>
						<p class="text-xs text-navy-500">{driver.vehicleColor} {driver.vehicle} &middot; {driver.plateNumber}</p>
					</div>
					<button
						onclick={() => (showMessaging = true)}
						class="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-600 transition hover:bg-navy-100"
					>
						<MessageCircle size={18} />
					</button>
					<button class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition hover:bg-teal-100">
						<Phone size={18} />
					</button>
				</div>
			</div>
		</div>

		<!-- Messaging panel (slides up from bottom) -->
		{#if showMessaging}
			<!-- Backdrop -->
			<button
				class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
				onclick={() => (showMessaging = false)}
				aria-label="關閉訊息"
			></button>

			<!-- Chat panel -->
			<div class="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-2xl animate-slide-up" style="max-height: 60vh;">
				<!-- Chat header -->
				<div class="flex items-center justify-between border-b border-navy-100 px-4 py-3">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
							陳
						</div>
						<div>
							<p class="text-sm font-semibold text-navy-900">{driver.name}</p>
							<p class="text-[11px] text-teal-600">線上</p>
						</div>
					</div>
					<button
						onclick={() => (showMessaging = false)}
						class="flex h-8 w-8 items-center justify-center rounded-full text-navy-400 transition hover:bg-navy-50 hover:text-navy-600"
					>
						<X size={18} />
					</button>
				</div>

				<!-- Messages -->
				<div class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
					{#each mockMessages as msg}
						<div class="flex items-end gap-2 {msg.from === 'driver' ? '' : 'justify-end'}">
							{#if msg.from === 'driver'}
								<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy-100 text-[10px] font-bold text-navy-600">
									司
								</div>
							{/if}
							<div class="{msg.from === 'driver' ? 'bg-navy-50 text-navy-800' : 'bg-amber-500 text-white'} max-w-[75%] rounded-2xl px-3.5 py-2.5">
								<p class="text-sm">{msg.from === 'driver' ? '司機：' : ''}{msg.text}</p>
								<p class="mt-0.5 text-[10px] {msg.from === 'driver' ? 'text-navy-400' : 'text-amber-200'}">{msg.time}</p>
							</div>
						</div>
					{/each}
				</div>

				<!-- Input field (non-functional, visual only) -->
				<div class="flex items-center gap-2 border-t border-navy-100 px-4 py-3">
					<input
						type="text"
						placeholder="輸入訊息..."
						class="flex-1 rounded-full border border-navy-200 bg-navy-50 px-4 py-2.5 text-sm text-navy-800 placeholder:text-navy-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
						disabled
					/>
					<button
						class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white opacity-50"
						disabled
					>
						<Send size={16} />
					</button>
				</div>
			</div>
		{/if}
	{/if}

	<!-- ===== STATE: IN-PROGRESS ===== -->
	{#if demoState === 'in-progress'}
		<div class="flex flex-1 flex-col animate-slide-up">
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

			<!-- Compact driver card + support -->
			<div class="px-5 py-4">
				<div class="mb-3 flex items-center gap-3 rounded-xl border border-navy-100 bg-white p-3 shadow-sm">
					<div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-navy-900 text-lg font-bold text-white">
						陳
					</div>
					<div class="flex-1">
						<p class="font-semibold text-navy-900">{driver.name}</p>
						<p class="text-xs text-navy-500">{driver.vehicleColor} {driver.vehicle} &middot; {driver.plateNumber}</p>
					</div>
					<button class="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-600 transition hover:bg-navy-100">
						<MessageCircle size={18} />
					</button>
				</div>

				<!-- Support button -->
				<button class="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-50 py-3 text-sm text-navy-500 transition hover:bg-navy-100">
					<PhoneCall size={16} />
					需要協助？
				</button>
			</div>
		</div>
	{/if}

	<!-- ===== STATE: COMPLETED ===== -->
	{#if demoState === 'completed'}
		<div class="flex flex-1 flex-col px-5 pt-8 animate-slide-up">
			{#if !submitted}
				<!-- Completion header -->
				<div class="mb-6 flex flex-col items-center text-center">
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 shadow-lg shadow-teal-200">
						<Check size={32} class="text-white" />
					</div>
					<h2 class="text-2xl font-bold text-navy-900">旅程完成！</h2>
					<p class="mt-1 text-sm text-navy-500">感謝您選擇 Airoota</p>
				</div>

				<!-- Trip summary card -->
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
						<div class="flex items-center gap-3 text-sm text-navy-500">
							<span class="flex items-center gap-1">
								<Clock size={14} />
								45 分鐘
							</span>
						</div>
						<span class="text-lg font-bold text-navy-900">TWD {booking.price.toLocaleString()}</span>
					</div>
				</div>

				<!-- Star rating -->
				<div class="mb-5 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
					<div class="mb-1 flex items-center gap-3">
						<div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-navy-900 text-lg font-bold text-white">
							陳
						</div>
						<div>
							<p class="font-semibold text-navy-900">{driver.name}</p>
							<p class="text-xs text-navy-400">您的旅程司機</p>
						</div>
					</div>

					<p class="mb-3 mt-4 text-center text-sm font-medium text-navy-700">為這趟旅程評分</p>
					<div class="flex items-center justify-center gap-2">
						{#each [1, 2, 3, 4, 5] as star}
							<button
								class="star-btn"
								onmouseenter={() => (hoverRating = star)}
								onmouseleave={() => (hoverRating = 0)}
								onclick={() => (rating = star)}
							>
								<Star
									size={36}
									class="{(hoverRating || rating) >= star
										? 'fill-amber-500 text-amber-500'
										: 'text-navy-200'} transition-colors"
								/>
							</button>
						{/each}
					</div>

					<!-- Comment -->
					<textarea
						bind:value={comment}
						placeholder="留下您的評語（選填）"
						class="mt-4 w-full resize-none rounded-xl border border-navy-200 bg-navy-50 p-3 text-sm text-navy-800 placeholder:text-navy-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
						rows="3"
					></textarea>
				</div>

				<!-- Tip section -->
				<div class="mb-5 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
					<div class="mb-1 flex items-center justify-between">
						<h3 class="font-semibold text-navy-900">給司機小費</h3>
					</div>
					<p class="mb-4 text-xs text-navy-400">小費 100% 歸司機所有</p>

					<div class="flex gap-2">
						{#each [50, 100, 200] as amount}
							<button
								onclick={() => selectTip(amount)}
								class="flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition
									{tipAmount === amount
										? 'border-amber-500 bg-amber-50 text-amber-700'
										: 'border-navy-200 text-navy-600 hover:border-navy-300'}"
							>
								TWD {amount}
							</button>
						{/each}
						<div class="flex-1">
							<input
								type="text"
								bind:value={customTip}
								placeholder="自訂"
								onfocus={() => (tipAmount = null)}
								class="w-full rounded-xl border-2 border-navy-200 py-2.5 text-center text-sm font-semibold text-navy-600 placeholder:text-navy-400 focus:border-amber-500 focus:outline-none"
							/>
						</div>
					</div>
				</div>

				<!-- Submit button -->
				<button
					onclick={() => (submitted = true)}
					class="mb-4 w-full rounded-xl bg-amber-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-200/50 transition hover:bg-amber-600 active:scale-[0.98]"
				>
					提交評價
				</button>

				<!-- Return trip CTA -->
				<a
					href="/book?type=dropoff"
					class="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-navy-200 py-3.5 text-sm font-semibold text-navy-700 transition hover:bg-navy-50"
				>
					預訂回程？
					<ArrowRight size={16} />
				</a>
			{:else}
				<!-- After submission -->
				<div class="flex flex-1 flex-col items-center justify-center py-16 text-center">
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 shadow-lg shadow-teal-200">
						<Check size={32} class="text-white" />
					</div>
					<h2 class="mb-2 text-xl font-bold text-navy-900">感謝您的評價！</h2>
					<p class="mb-6 text-sm text-navy-500">您的回饋對司機非常重要</p>

					<a
						href="/trips"
						class="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
					>
						返回我的行程
					</a>

					<a
						href="/book?type=dropoff"
						class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-600 transition hover:text-amber-700"
					>
						預訂回程
						<ArrowRight size={14} />
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>
