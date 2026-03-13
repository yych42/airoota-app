<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		airports,
		vehicles,
		currentBooking,
		type TripType,
		type VehicleType
	} from '$lib/stores/booking';
	import {
		Plane,
		Car,
		Users,
		Briefcase,
		CreditCard,
		Smartphone,
		MessageCircle,
		MapPin,
		Calendar,
		Clock,
		ChevronLeft,
		ChevronDown,
		Check,
		Shield,
		Baby,
		Plus,
		Minus,
		Trash2,
		Receipt,
		VolumeOff
	} from 'lucide-svelte';

	// ── Trip Type from URL ─────────────────────────────
	const urlType = page.url.searchParams.get('type');
	let tripType: TripType = urlType === 'dropoff' ? 'dropoff' : 'pickup';

	// ── State ──────────────────────────────────────────
	let airportCode = $state('TPE');
	let date = $state('');
	let time = $state('');
	let flightNumber = $state('');

	// Structured address
	let selectedCity = $state('');
	let selectedDistrict = $state('');
	let specificAddress = $state('');

	// Passengers & luggage
	let passengerCount = $state(1);
	let largeLuggageCount = $state(0);
	let smallLuggageCount = $state(0);

	// Child safety seats
	let childSeatEnabled = $state(false);
	let childSeats = $state<string[]>([]);

	// Receipt
	let needsReceipt = $state(false);

	// Quiet ride preference
	let quietRide = $state(false);

	// Vehicle & payment
	let selectedVehicle = $state<VehicleType>('standard');
	let paymentMethod = $state('credit-card');

	let currentStep = $state(1);

	// ── City/District data ─────────────────────────────
	const airportCities: Record<string, string[]> = {
		TPE: ['台北市', '新北市', '桃園市', '基隆市', '新竹市', '新竹縣'],
		TSA: ['台北市', '新北市'],
		KHH: ['高雄市', '屏東縣', '台南市'],
		RMQ: ['台中市', '彰化縣', '南投縣']
	};

	const cityDistricts: Record<string, string[]> = {
		'台北市': ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'],
		'新北市': ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '土城區', '蘆洲區', '汐止區', '樹林區', '淡水區', '三峽區', '林口區', '五股區', '泰山區'],
		'桃園市': ['桃園區', '中壢區', '大溪區', '楊梅區', '蘆竹區', '龜山區', '八德區', '大園區', '平鎮區'],
		'高雄市': ['前鎮區', '苓雅區', '左營區', '三民區', '鳳山區', '小港區', '楠梓區', '鼓山區', '新興區', '前金區'],
		'台中市': ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區', '豐原區'],
		'基隆市': ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '暖暖區', '七堵區'],
		'新竹市': ['東區', '北區', '香山區'],
		'新竹縣': ['竹北市', '竹東鎮', '新埔鎮', '湖口鄉', '新豐鄉'],
		'屏東縣': ['屏東市', '潮州鎮', '東港鎮', '萬丹鄉', '長治鄉'],
		'台南市': ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '新營區'],
		'彰化縣': ['彰化市', '員林市', '鹿港鎮', '和美鎮', '溪湖鎮'],
		'南投縣': ['南投市', '埔里鎮', '草屯鎮', '竹山鎮', '集集鎮']
	};

	// ── Vehicle constraints ────────────────────────────
	interface VehicleConstraint {
		maxPassengers: number;
		maxLargeLuggage: number;
		maxSmallLuggage: number;
		conditionalLuggage?: { minPassengers: number; maxLargeLuggage: number; maxSmallLuggage: number };
	}

	const vehicleConstraints: Record<string, VehicleConstraint> = {
		standard: { maxPassengers: 3, maxLargeLuggage: 2, maxSmallLuggage: 2 },
		premium: { maxPassengers: 3, maxLargeLuggage: 3, maxSmallLuggage: 2 },
		suv: {
			maxPassengers: 6,
			maxLargeLuggage: 4,
			maxSmallLuggage: 3,
			conditionalLuggage: { minPassengers: 5, maxLargeLuggage: 2, maxSmallLuggage: 2 }
		},
		van9: {
			maxPassengers: 8,
			maxLargeLuggage: 6,
			maxSmallLuggage: 2,
			conditionalLuggage: { minPassengers: 7, maxLargeLuggage: 3, maxSmallLuggage: 2 }
		}
	};

	const childSeatOptions = [
		'0-1 歲（後向式安全座椅）',
		'1-3 歲（前向式安全座椅）',
		'3-8 歲（增高墊）'
	];

	// ── Derived ────────────────────────────────────────
	let selectedAirport = $derived(airports.find((a) => a.code === airportCode) ?? airports[0]);
	let selectedVehicleObj = $derived(vehicles.find((v) => v.type === selectedVehicle) ?? vehicles[0]);
	let availableCities = $derived(airportCities[airportCode] ?? []);
	let availableDistricts = $derived(selectedCity ? (cityDistricts[selectedCity] ?? []) : []);
	let fullAddress = $derived(
		selectedCity && selectedDistrict && specificAddress
			? `${selectedCity}${selectedDistrict}${specificAddress}`
			: ''
	);
	let step1Valid = $derived(
		airportCode !== '' &&
		date !== '' &&
		time !== '' &&
		selectedCity !== '' &&
		selectedDistrict !== '' &&
		specificAddress !== '' &&
		passengerCount >= 1
	);

	let childSeatTotal = $derived(childSeats.length * 200);
	let totalPrice = $derived(selectedVehicleObj.basePrice + childSeatTotal);

	// ── Effects for cascading resets ───────────────────
	let prevAirportCode = airportCode;
	$effect(() => {
		if (airportCode !== prevAirportCode) {
			selectedCity = '';
			selectedDistrict = '';
			prevAirportCode = airportCode;
		}
	});

	let prevCity = selectedCity;
	$effect(() => {
		if (selectedCity !== prevCity) {
			selectedDistrict = '';
			prevCity = selectedCity;
		}
	});

	// Reset child seats when toggled off
	$effect(() => {
		if (!childSeatEnabled) {
			childSeats = [];
		}
	});

	// ── Vehicle eligibility check ──────────────────────
	function isVehicleDisabled(vehicleType: string): boolean {
		const c = vehicleConstraints[vehicleType];
		if (!c) return false;
		if (passengerCount > c.maxPassengers) return true;
		const effectiveMaxLarge = c.conditionalLuggage && passengerCount >= c.conditionalLuggage.minPassengers
			? c.conditionalLuggage.maxLargeLuggage
			: c.maxLargeLuggage;
		const effectiveMaxSmall = c.conditionalLuggage && passengerCount >= c.conditionalLuggage.minPassengers
			? c.conditionalLuggage.maxSmallLuggage
			: c.maxSmallLuggage;
		if (largeLuggageCount > effectiveMaxLarge) return true;
		if (smallLuggageCount > effectiveMaxSmall) return true;
		return false;
	}

	function getVehicleCapacityLabel(vehicleType: string): string {
		const c = vehicleConstraints[vehicleType];
		if (!c) return '';
		let label = `最多 ${c.maxPassengers} 位乘客、${c.maxLargeLuggage} 大 + ${c.maxSmallLuggage} 小行李`;
		if (c.conditionalLuggage) {
			label += `（${c.conditionalLuggage.minPassengers} 人以上：${c.conditionalLuggage.maxLargeLuggage} 大 + ${c.conditionalLuggage.maxSmallLuggage} 小）`;
		}
		return label;
	}

	// ── Helpers ────────────────────────────────────────
	function formatPrice(price: number): string {
		return `TWD ${price.toLocaleString()}`;
	}

	function formatDate(d: string): string {
		if (!d) return '';
		const dt = new Date(d + 'T00:00:00');
		return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
	}

	function goToStep(step: number) {
		// If moving to step 2, ensure selected vehicle is still valid
		if (step === 2 && isVehicleDisabled(selectedVehicle)) {
			// Auto-select the first available vehicle
			const firstValid = vehicles.find(v => !isVehicleDisabled(v.type));
			if (firstValid) selectedVehicle = firstValid.type;
		}
		currentStep = step;
		const el = document.getElementById(`step-${step}`);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function addChildSeat() {
		childSeats = [...childSeats, childSeatOptions[0]];
	}

	function removeChildSeat(index: number) {
		childSeats = childSeats.filter((_, i) => i !== index);
	}

	function updateChildSeat(index: number, value: string) {
		childSeats = childSeats.map((s, i) => (i === index ? value : s));
	}

	function confirmBooking() {
		const booking = {
			id: `b-${Date.now()}`,
			tripType,
			airport: selectedAirport,
			address: fullAddress,
			date,
			time,
			flightNumber,
			vehicle: selectedVehicleObj,
			price: totalPrice,
			state: 'pending' as const,
			driver: null,
			paymentMethod
		};
		currentBooking.set(booking);
		goto('/book/confirmed');
	}

	function vehicleIconSize(type: VehicleType): number {
		if (type === 'van9') return 30;
		if (type === 'suv') return 28;
		if (type === 'premium') return 26;
		return 24;
	}

	const paymentMethods = [
		{ id: 'credit-card', label: '信用卡', Icon: CreditCard },
		{ id: 'apple-pay', label: 'Apple Pay', Icon: Smartphone },
		{ id: 'line-pay', label: 'LINE Pay', Icon: MessageCircle }
	] as const;
</script>

<svelte:head>
	<title>預訂接送 — Airoota</title>
</svelte:head>

<div class="page-transition px-4 pt-4 pb-8">
	<!-- Header -->
	<div class="mb-6 flex items-center gap-3">
		<button
			onclick={() => history.back()}
			class="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700 transition-colors active:bg-navy-100"
		>
			<ChevronLeft size={20} />
		</button>
		<div>
			<h1 class="text-xl font-bold text-navy-900">
				{tripType === 'pickup' ? '機場接機' : '機場送機'}
			</h1>
			<p class="text-xs text-navy-400">
				{tripType === 'pickup' ? '從機場前往您的目的地' : '從出發地前往機場'}
			</p>
		</div>
	</div>

	<!-- Progress Indicator -->
	<div class="mb-8 flex items-center justify-center gap-3">
		{#each [1, 2, 3] as step}
			{@const labels = ['行程資訊', '選擇車型', '確認付款']}
			<button
				onclick={() => { if (step < currentStep) goToStep(step); }}
				class="flex items-center gap-2 {step <= currentStep ? 'cursor-pointer' : 'cursor-default'}"
			>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300
						{step < currentStep
							? 'bg-teal-500 text-white'
							: step === currentStep
								? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
								: 'bg-navy-100 text-navy-400'}"
				>
					{#if step < currentStep}
						<Check size={16} strokeWidth={3} />
					{:else}
						{step}
					{/if}
				</div>
				<span
					class="hidden text-xs font-medium sm:inline
						{step === currentStep ? 'text-navy-900' : 'text-navy-400'}"
				>
					{labels[step - 1]}
				</span>
			</button>
			{#if step < 3}
				<div
					class="h-0.5 w-8 rounded-full transition-colors duration-300
						{step < currentStep ? 'bg-teal-500' : 'bg-navy-100'}"
				></div>
			{/if}
		{/each}
	</div>

	<!-- ═══════════════════════════════════════════════ -->
	<!-- STEP 1 — Trip Details                          -->
	<!-- ═══════════════════════════════════════════════ -->
	<section
		id="step-1"
		class="transition-all duration-500 {currentStep === 1 ? 'opacity-100' : 'pointer-events-none hidden'}"
	>
		<div class="space-y-6 overflow-hidden">
			<!-- ── Section: Airport & Flight ── -->
			<div class="space-y-4">
				<h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500">
					<Plane size={14} class="text-navy-400" />
					機場與航班
				</h2>

				<!-- Airport Selector -->
				<div>
					<label for="airport" class="mb-2 block text-sm font-semibold text-navy-700">
						選擇機場
					</label>
					<div class="relative">
						<select
							id="airport"
							bind:value={airportCode}
							class="w-full appearance-none rounded-xl border border-navy-200 bg-white px-4 py-3.5 pr-10 text-sm font-medium text-navy-900 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
						>
							{#each airports as airport}
								<option value={airport.code}>
									{airport.code} — {airport.nameZh}
								</option>
							{/each}
						</select>
						<ChevronDown size={16} class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-navy-400" />
					</div>
				</div>

				<!-- Date & Time -->
				<div>
					<label for="date" class="mb-2 block text-sm font-semibold text-navy-700">
						<Calendar size={14} class="mb-0.5 mr-1 inline text-navy-400" />
						日期
					</label>
					<input
						id="date"
						type="date"
						bind:value={date}
						class="box-border min-w-0 max-w-full w-full rounded-xl border border-navy-200 bg-white px-4 py-3.5 text-sm font-medium text-navy-900 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
					/>
				</div>
				<div>
					<label for="time" class="mb-2 block text-sm font-semibold text-navy-700">
						<Clock size={14} class="mb-0.5 mr-1 inline text-navy-400" />
						時間
					</label>
					<input
						id="time"
						type="time"
						bind:value={time}
						class="box-border min-w-0 max-w-full w-full rounded-xl border border-navy-200 bg-white px-4 py-3.5 text-sm font-medium text-navy-900 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
					/>
				</div>

				<!-- Flight Number (pickup only) -->
				{#if tripType === 'pickup'}
					<div class="animate-slide-up">
						<label for="flight" class="mb-2 block text-sm font-semibold text-navy-700">
							航班編號
							<span class="ml-1 text-xs font-normal text-navy-400">（選填）</span>
						</label>
						<input
							id="flight"
							type="text"
							bind:value={flightNumber}
							placeholder="例如：BR872"
							class="w-full rounded-xl border border-navy-200 bg-white px-4 py-3.5 text-sm font-medium text-navy-900 placeholder:text-navy-300 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
						/>
						<p class="mt-1.5 text-xs text-navy-400">方便司機追蹤您的航班動態</p>
					</div>
				{/if}
			</div>

			<!-- Divider -->
			<div class="h-px bg-navy-100"></div>

			<!-- ── Section: Address ── -->
			<div class="space-y-4">
				<h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500">
					<MapPin size={14} class="text-navy-400" />
					{tripType === 'pickup' ? '目的地地址' : '出發地地址'}
				</h2>

				<!-- City Dropdown -->
				<div>
					<label for="city" class="mb-2 block text-sm font-semibold text-navy-700">
						城市
					</label>
					<div class="relative">
						<select
							id="city"
							bind:value={selectedCity}
							class="w-full appearance-none rounded-xl border border-navy-200 bg-white px-4 py-3.5 pr-10 text-sm font-medium text-navy-900 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
						>
							<option value="">請選擇城市</option>
							{#each availableCities as city}
								<option value={city}>{city}</option>
							{/each}
						</select>
						<ChevronDown size={16} class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-navy-400" />
					</div>
				</div>

				<!-- District Dropdown -->
				<div>
					<label for="district" class="mb-2 block text-sm font-semibold text-navy-700">
						區域
					</label>
					<div class="relative">
						<select
							id="district"
							bind:value={selectedDistrict}
							disabled={!selectedCity}
							class="w-full appearance-none rounded-xl border border-navy-200 bg-white px-4 py-3.5 pr-10 text-sm font-medium text-navy-900 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-navy-400"
						>
							<option value="">{selectedCity ? '請選擇區域' : '請先選擇城市'}</option>
							{#each availableDistricts as district}
								<option value={district}>{district}</option>
							{/each}
						</select>
						<ChevronDown size={16} class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-navy-400" />
					</div>
				</div>

				<!-- Specific Address -->
				<div>
					<label for="specific-address" class="mb-2 block text-sm font-semibold text-navy-700">
						詳細地址
					</label>
					<input
						id="specific-address"
						type="text"
						bind:value={specificAddress}
						disabled={!selectedDistrict}
						placeholder="路名、門牌號碼、樓層"
						class="w-full rounded-xl border border-navy-200 bg-white px-4 py-3.5 text-sm font-medium text-navy-900 placeholder:text-navy-300 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-navy-400"
					/>
					{#if fullAddress}
						<p class="mt-1.5 text-xs text-teal-600">完整地址：{fullAddress}</p>
					{/if}
				</div>
			</div>

			<!-- Divider -->
			<div class="h-px bg-navy-100"></div>

			<!-- ── Section: Passengers & Luggage ── -->
			<div class="space-y-4">
				<h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500">
					<Users size={14} class="text-navy-400" />
					乘客與行李
				</h2>

				<!-- Passenger Count -->
				<div class="flex items-center justify-between rounded-xl border border-navy-200 bg-white px-4 py-3">
					<div>
						<p class="text-sm font-semibold text-navy-900">乘客人數</p>
					</div>
					<div class="flex items-center gap-3">
						<button
							onclick={() => { if (passengerCount > 1) passengerCount--; }}
							disabled={passengerCount <= 1}
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 text-navy-600 transition-all hover:bg-navy-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
						>
							<Minus size={16} />
						</button>
						<span class="w-6 text-center text-base font-bold text-navy-900">{passengerCount}</span>
						<button
							onclick={() => { if (passengerCount < 8) passengerCount++; }}
							disabled={passengerCount >= 8}
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 text-navy-600 transition-all hover:bg-navy-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
						>
							<Plus size={16} />
						</button>
					</div>
				</div>

				<!-- Large Luggage Count -->
				<div class="flex items-center justify-between rounded-xl border border-navy-200 bg-white px-4 py-3">
					<div>
						<p class="text-sm font-semibold text-navy-900">大件行李</p>
						<p class="text-xs text-navy-400">24吋以上</p>
					</div>
					<div class="flex items-center gap-3">
						<button
							onclick={() => { if (largeLuggageCount > 0) largeLuggageCount--; }}
							disabled={largeLuggageCount <= 0}
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 text-navy-600 transition-all hover:bg-navy-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
						>
							<Minus size={16} />
						</button>
						<span class="w-6 text-center text-base font-bold text-navy-900">{largeLuggageCount}</span>
						<button
							onclick={() => { if (largeLuggageCount < 10) largeLuggageCount++; }}
							disabled={largeLuggageCount >= 10}
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 text-navy-600 transition-all hover:bg-navy-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
						>
							<Plus size={16} />
						</button>
					</div>
				</div>

				<!-- Small Luggage Count -->
				<div class="flex items-center justify-between rounded-xl border border-navy-200 bg-white px-4 py-3">
					<div>
						<p class="text-sm font-semibold text-navy-900">小件行李</p>
						<p class="text-xs text-navy-400">24吋以下</p>
					</div>
					<div class="flex items-center gap-3">
						<button
							onclick={() => { if (smallLuggageCount > 0) smallLuggageCount--; }}
							disabled={smallLuggageCount <= 0}
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 text-navy-600 transition-all hover:bg-navy-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
						>
							<Minus size={16} />
						</button>
						<span class="w-6 text-center text-base font-bold text-navy-900">{smallLuggageCount}</span>
						<button
							onclick={() => { if (smallLuggageCount < 10) smallLuggageCount++; }}
							disabled={smallLuggageCount >= 10}
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 text-navy-600 transition-all hover:bg-navy-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
						>
							<Plus size={16} />
						</button>
					</div>
				</div>
			</div>

			<!-- Divider -->
			<div class="h-px bg-navy-100"></div>

			<!-- ── Section: Child Safety Seats ── -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500">
						<Baby size={14} class="text-navy-400" />
						兒童安全座椅
					</h2>
					<button
						onclick={() => (childSeatEnabled = !childSeatEnabled)}
						class="relative h-7 w-12 rounded-full transition-colors duration-200 {childSeatEnabled ? 'bg-amber-500' : 'bg-navy-200'}"
					>
						<span
							class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 {childSeatEnabled ? 'translate-x-5' : 'translate-x-0'}"
						></span>
					</button>
				</div>

				{#if childSeatEnabled}
					<div class="animate-slide-up space-y-3">
						{#if childSeats.length > 0}
							<p class="text-xs font-medium text-amber-600">
								{childSeats.length} 座安全座椅 · {formatPrice(childSeatTotal)}
							</p>
						{/if}

						{#each childSeats as seat, index}
							<div class="flex items-center gap-2">
								<div class="relative flex-1">
									<select
										value={seat}
										onchange={(e) => updateChildSeat(index, (e.target as HTMLSelectElement).value)}
										class="w-full appearance-none rounded-xl border border-navy-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-navy-900 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
									>
										{#each childSeatOptions as option}
											<option value={option}>{option}</option>
										{/each}
									</select>
									<ChevronDown size={16} class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-navy-400" />
								</div>
								<button
									onclick={() => removeChildSeat(index)}
									class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
								>
									<Trash2 size={16} />
								</button>
							</div>
						{/each}

						<button
							onclick={addChildSeat}
							class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-navy-300 px-4 py-3 text-sm font-medium text-navy-500 transition-all hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-600"
						>
							<Plus size={16} />
							新增安全座椅
						</button>

						<p class="text-xs text-navy-400">每座安全座椅加收 TWD 200</p>
					</div>
				{/if}
			</div>

			<!-- Divider -->
			<div class="h-px bg-navy-100"></div>

			<!-- ── Section: Receipt ── -->
			<div class="flex items-center justify-between">
				<div>
					<h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500">
						<Receipt size={14} class="text-navy-400" />
						需要統一發票（紙本）
					</h2>
					<p class="mt-1 text-xs text-navy-400">司機將於行程結束時提供紙本發票</p>
				</div>
				<button
					onclick={() => (needsReceipt = !needsReceipt)}
					class="relative h-7 w-12 rounded-full transition-colors duration-200 {needsReceipt ? 'bg-amber-500' : 'bg-navy-200'}"
				>
					<span
						class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 {needsReceipt ? 'translate-x-5' : 'translate-x-0'}"
					></span>
				</button>
			</div>

			<!-- Divider -->
			<div class="h-px bg-navy-100"></div>

			<!-- ── Section: Quiet Ride ── -->
			<div class="flex items-center justify-between">
				<div>
					<h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500">
						<VolumeOff size={14} class="text-navy-400" />
						安靜乘車
					</h2>
					<p class="mt-1 text-xs text-navy-400">司機將不主動交談，讓您享受安靜旅程</p>
				</div>
				<button
					onclick={() => (quietRide = !quietRide)}
					aria-label="安靜乘車"
					class="relative h-7 w-12 rounded-full transition-colors duration-200 {quietRide ? 'bg-amber-500' : 'bg-navy-200'}"
				>
					<span
						class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 {quietRide ? 'translate-x-5' : 'translate-x-0'}"
					></span>
				</button>
			</div>

			<!-- Continue Button -->
			<button
				onclick={() => goToStep(2)}
				disabled={!step1Valid}
				class="mt-2 w-full rounded-xl bg-amber-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
			>
				繼續
			</button>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════ -->
	<!-- STEP 2 — Vehicle & Price                       -->
	<!-- ═══════════════════════════════════════════════ -->
	<section
		id="step-2"
		class="transition-all duration-500 {currentStep === 2 ? 'animate-slide-up opacity-100' : 'pointer-events-none hidden'}"
	>
		<div class="space-y-5">
			<div>
				<h2 class="text-lg font-bold text-navy-900">選擇車型</h2>
				<p class="mt-1 text-sm text-navy-500">
					{passengerCount} 位乘客 · {largeLuggageCount} 大件 + {smallLuggageCount} 小件行李
				</p>
			</div>

			<!-- Vehicle Cards -->
			<div class="space-y-3">
				{#each vehicles as vehicle}
					{@const isSelected = selectedVehicle === vehicle.type}
					{@const disabled = isVehicleDisabled(vehicle.type)}
					<button
						onclick={() => { if (!disabled) selectedVehicle = vehicle.type; }}
						disabled={disabled}
						class="w-full rounded-2xl border-2 p-4 text-left transition-all duration-200
							{disabled
								? 'cursor-not-allowed border-navy-100 bg-navy-50/50 opacity-60'
								: isSelected
									? 'border-amber-500 bg-amber-50/50 shadow-lg shadow-amber-500/10'
									: 'border-navy-100 bg-white hover:border-navy-200 hover:shadow-md'}"
					>
						<div class="flex items-start gap-4">
							<!-- Vehicle Icon -->
							<div
								class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl
									{disabled
										? 'bg-navy-100'
										: isSelected ? 'bg-amber-100' : 'bg-navy-50'}"
							>
								<Car
									size={vehicleIconSize(vehicle.type)}
									class={disabled ? 'text-navy-300' : isSelected ? 'text-amber-600' : 'text-navy-500'}
								/>
							</div>

							<!-- Vehicle Info -->
							<div class="min-w-0 flex-1">
								<div class="flex items-center justify-between">
									<h3 class="font-bold {disabled ? 'text-navy-400' : 'text-navy-900'}">{vehicle.nameZh}</h3>
									{#if isSelected && !disabled}
										<div class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
											<Check size={14} strokeWidth={3} class="text-white" />
										</div>
									{/if}
								</div>
								<p class="mt-0.5 text-xs {disabled ? 'text-navy-300' : 'text-navy-500'}">{vehicle.description}</p>

								<!-- Capacity detail -->
								<p class="mt-1 text-xs {disabled ? 'text-navy-300' : 'text-navy-400'}">
									{getVehicleCapacityLabel(vehicle.type)}
								</p>

								{#if disabled}
									<p class="mt-2 text-xs font-medium text-red-400">
										載客或行李數量超過此車型上限
									</p>
								{:else}
									<!-- Price -->
									<div class="mt-2.5">
										<span class="text-lg font-bold {isSelected ? 'text-amber-600' : 'text-navy-900'}">
											{formatPrice(vehicle.basePrice)}
										</span>
										<span class="ml-1.5 text-xs text-navy-400">起</span>
									</div>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>

			<!-- Inclusions -->
			<div class="rounded-xl bg-navy-50 px-4 py-3">
				<div class="flex items-start gap-2">
					<Shield size={16} class="mt-0.5 flex-shrink-0 text-teal-500" />
					<p class="text-xs leading-relaxed text-navy-600">
						包含：免費等候 90 分鐘 · 航班監控 · 舉牌接機
					</p>
				</div>
			</div>

			<!-- Cancel Policy Link -->
			<div class="text-center">
				<button class="text-xs font-medium text-navy-500 underline decoration-navy-300 underline-offset-2 transition-colors hover:text-navy-700">
					查看取消政策
				</button>
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-3">
				<button
					onclick={() => goToStep(1)}
					class="rounded-xl border border-navy-200 px-5 py-4 text-sm font-semibold text-navy-600 transition-all hover:bg-navy-50 active:scale-[0.98]"
				>
					返回
				</button>
				<button
					onclick={() => goToStep(3)}
					class="flex-1 rounded-xl bg-amber-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-600 active:scale-[0.98]"
				>
					確認車型
				</button>
			</div>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════ -->
	<!-- STEP 3 — Confirm & Pay                         -->
	<!-- ═══════════════════════════════════════════════ -->
	<section
		id="step-3"
		class="transition-all duration-500 {currentStep === 3 ? 'animate-slide-up opacity-100' : 'pointer-events-none hidden'}"
	>
		<div class="space-y-5">
			<div>
				<h2 class="text-lg font-bold text-navy-900">確認預訂</h2>
				<p class="mt-1 text-sm text-navy-500">請確認以下行程資訊</p>
			</div>

			<!-- Trip Summary Card -->
			<div class="rounded-2xl border border-navy-100 bg-navy-50/50 p-5">
				<div class="space-y-4">
					<!-- Trip Type Badge -->
					<div class="flex items-center gap-2">
						<span
							class="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white"
						>
							{#if tripType === 'pickup'}
								<Plane size={12} />
								接機
							{:else}
								<Car size={12} />
								送機
							{/if}
						</span>
					</div>

					<!-- Details Grid -->
					<div class="space-y-3">
						<div class="flex items-start gap-3">
							<Plane size={16} class="mt-0.5 flex-shrink-0 text-navy-400" />
							<div>
								<p class="text-xs text-navy-500">機場</p>
								<p class="text-sm font-semibold text-navy-900">
									{selectedAirport.code} — {selectedAirport.nameZh}
								</p>
							</div>
						</div>

						<div class="flex items-start gap-3">
							<MapPin size={16} class="mt-0.5 flex-shrink-0 text-navy-400" />
							<div>
								<p class="text-xs text-navy-500">
									{tripType === 'pickup' ? '目的地' : '出發地'}
								</p>
								<p class="text-sm font-semibold text-navy-900">{fullAddress}</p>
							</div>
						</div>

						<div class="flex gap-6">
							<div class="flex items-start gap-3">
								<Calendar size={16} class="mt-0.5 flex-shrink-0 text-navy-400" />
								<div>
									<p class="text-xs text-navy-500">日期</p>
									<p class="text-sm font-semibold text-navy-900">{formatDate(date)}</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Clock size={16} class="mt-0.5 flex-shrink-0 text-navy-400" />
								<div>
									<p class="text-xs text-navy-500">時間</p>
									<p class="text-sm font-semibold text-navy-900">{time}</p>
								</div>
							</div>
						</div>

						{#if flightNumber}
							<div class="flex items-start gap-3">
								<Plane size={16} class="mt-0.5 flex-shrink-0 text-navy-400" />
								<div>
									<p class="text-xs text-navy-500">航班編號</p>
									<p class="text-sm font-semibold text-navy-900">{flightNumber}</p>
								</div>
							</div>
						{/if}

						<!-- Passengers & Luggage Summary -->
						<div class="flex items-start gap-3">
							<Users size={16} class="mt-0.5 flex-shrink-0 text-navy-400" />
							<div>
								<p class="text-xs text-navy-500">乘客與行李</p>
								<p class="text-sm font-semibold text-navy-900">
									{passengerCount} 位乘客 · {largeLuggageCount} 大件 + {smallLuggageCount} 小件行李
								</p>
							</div>
						</div>

						<!-- Child Seats (if any) -->
						{#if childSeats.length > 0}
							<div class="flex items-start gap-3">
								<Baby size={16} class="mt-0.5 flex-shrink-0 text-navy-400" />
								<div>
									<p class="text-xs text-navy-500">兒童安全座椅</p>
									{#each childSeats as seat}
										<p class="text-sm font-semibold text-navy-900">{seat}</p>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Receipt -->
						{#if needsReceipt}
							<div class="flex items-start gap-3">
								<Receipt size={16} class="mt-0.5 flex-shrink-0 text-navy-400" />
								<div>
									<p class="text-xs text-navy-500">統一發票</p>
									<p class="text-sm font-semibold text-navy-900">需要紙本發票</p>
								</div>
							</div>
						{/if}

						<!-- Quiet Ride -->
						{#if quietRide}
							<div class="flex items-start gap-3">
								<VolumeOff size={16} class="mt-0.5 flex-shrink-0 text-navy-400" />
								<div>
									<p class="text-xs text-navy-500">乘車偏好</p>
									<p class="text-sm font-semibold text-navy-900">安靜乘車</p>
								</div>
							</div>
						{/if}

						<!-- Vehicle & Price Breakdown -->
						<div class="border-t border-navy-200 pt-3">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
										<Car size={20} class="text-amber-600" />
									</div>
									<div>
										<p class="text-sm font-bold text-navy-900">{selectedVehicleObj.nameZh}</p>
										<p class="text-xs text-navy-500">
											{getVehicleCapacityLabel(selectedVehicleObj.type)}
										</p>
									</div>
								</div>
							</div>

							<!-- Price Breakdown -->
							<div class="mt-4 space-y-2">
								<div class="flex items-center justify-between text-sm">
									<span class="text-navy-600">車資</span>
									<span class="font-medium text-navy-900">{formatPrice(selectedVehicleObj.basePrice)}</span>
								</div>
								{#if childSeats.length > 0}
									<div class="flex items-center justify-between text-sm">
										<span class="text-navy-600">安全座椅 x {childSeats.length}</span>
										<span class="font-medium text-navy-900">{formatPrice(childSeatTotal)}</span>
									</div>
								{/if}
								<div class="flex items-center justify-between border-t border-navy-200 pt-2">
									<span class="text-base font-bold text-navy-900">總金額</span>
									<span class="text-lg font-bold text-amber-600">{formatPrice(totalPrice)}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Payment Method -->
			<div>
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="mb-3 block text-sm font-semibold text-navy-700">付款方式</label>
				<div class="space-y-2">
					{#each paymentMethods as method}
						{@const isSelected = paymentMethod === method.id}
						<button
							onclick={() => (paymentMethod = method.id)}
							class="flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3.5 transition-all duration-200
								{isSelected
									? 'border-amber-500 bg-amber-50/50'
									: 'border-navy-100 bg-white hover:border-navy-200'}"
						>
							<div
								class="flex h-10 w-10 items-center justify-center rounded-lg
									{isSelected ? 'bg-amber-100' : 'bg-navy-50'}"
							>
								<method.Icon size={20} class={isSelected ? 'text-amber-600' : 'text-navy-500'} />
							</div>
							<span class="text-sm font-semibold {isSelected ? 'text-navy-900' : 'text-navy-600'}">
								{method.label}
							</span>
							<div class="ml-auto">
								<div
									class="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all
										{isSelected ? 'border-amber-500 bg-amber-500' : 'border-navy-300'}"
								>
									{#if isSelected}
										<Check size={12} strokeWidth={3} class="text-white" />
									{/if}
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="space-y-3 pt-2">
				<button
					onclick={confirmBooking}
					class="w-full rounded-xl bg-amber-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-600 active:scale-[0.98]"
				>
					確認預訂 · {formatPrice(totalPrice)}
				</button>
				<button
					onclick={() => goToStep(2)}
					class="w-full rounded-xl border border-navy-200 px-6 py-3 text-sm font-semibold text-navy-600 transition-all hover:bg-navy-50 active:scale-[0.98]"
				>
					返回修改
				</button>
			</div>
		</div>
	</section>
</div>
