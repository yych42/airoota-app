<script lang="ts">
	import {
		Plane,
		PlaneLanding,
		PlaneTakeoff,
		ShieldCheck,
		BadgeDollarSign,
		Radar,
		CalendarClock,
		Car,
		MapPinCheck
	} from 'lucide-svelte';

	let lang = $state<'zh' | 'en'>('zh');

	function toggleLang() {
		lang = lang === 'zh' ? 'en' : 'zh';
	}
</script>

<svelte:head>
	<title>Airoota — 機場接送，安心出發</title>
	<meta name="description" content="專業機場接送服務，固定價格，即時航班追蹤" />
</svelte:head>

<div class="min-h-screen bg-white">
	<!-- ===== HERO SECTION ===== -->
	<section class="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-700 px-6 pb-8 pt-6">
		<!-- Top bar: Logo + Language toggle -->
		<header class="flex items-center justify-between animate-slide-up" style="animation-delay: 0ms;">
			<div class="flex items-center gap-2">
				<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 backdrop-blur-sm">
					<Plane class="h-5 w-5 text-amber-400" strokeWidth={2.2} />
				</div>
				<span class="text-xl font-bold tracking-tight text-white">
					Air<span class="text-amber-400">oota</span>
				</span>
			</div>
			<button
				onclick={toggleLang}
				class="rounded-lg px-3 py-1.5 text-xs font-medium text-navy-200 transition-colors hover:bg-white/10 hover:text-white"
			>
				{lang === 'zh' ? 'EN' : '繁體中文'}
			</button>
		</header>

		<!-- Hero content -->
		<div class="mt-8 text-center animate-slide-up" style="animation-delay: 80ms;">
			<h1 class="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
				{lang === 'zh' ? '機場接送，安心出發' : 'Airport Transfers, Depart with Confidence'}
			</h1>
			<p class="mt-3 text-base font-medium text-navy-200">
				{lang === 'zh'
					? '專業司機 · 固定價格 · 即時追蹤'
					: 'Professional Drivers · Fixed Pricing · Live Tracking'}
			</p>
		</div>

		<!-- Abstract runway / route illustration -->
		<div class="mt-6 flex justify-center animate-slide-up" style="animation-delay: 160ms;">
			<svg viewBox="0 0 320 70" class="w-full max-w-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
				<!-- Runway dashes -->
				<line x1="40" y1="40" x2="280" y2="40" stroke="#334e68" stroke-width="1.5" stroke-dasharray="6 5" />

				<!-- Route curve — smooth arc connecting all three dots -->
				<path
					d="M 50 40 C 100 12, 130 12, 160 22 C 190 32, 230 10, 270 14"
					stroke="#27ab83"
					stroke-width="2.5"
					fill="none"
					stroke-linecap="round"
					opacity="0.8"
				/>

				<!-- Origin dot -->
				<circle cx="50" cy="40" r="5" fill="#27ab83" opacity="0.25" />
				<circle cx="50" cy="40" r="3" fill="#27ab83" />

				<!-- Mid waypoint (on the curve at ~160, 22) -->
				<circle cx="160" cy="22" r="4" fill="#f0b429" opacity="0.25">
					<animate attributeName="r" values="4;7;4" dur="2.5s" repeatCount="indefinite" />
					<animate attributeName="opacity" values="0.25;0.08;0.25" dur="2.5s" repeatCount="indefinite" />
				</circle>
				<circle cx="160" cy="22" r="2.5" fill="#f0b429" />

				<!-- Destination dot -->
				<circle cx="270" cy="14" r="5" fill="#27ab83" opacity="0.25" />
				<circle cx="270" cy="14" r="3" fill="#27ab83" />

				<!-- Plane — positioned on the curve between mid and dest, tangent-aligned -->
				<g transform="translate(218, 15) rotate(-12)">
					<polygon points="0,-4 10,0 0,4 2,0" fill="#f0b429" opacity="0.9" />
				</g>

				<!-- Labels -->
				<text x="50" y="58" text-anchor="middle" fill="#9fb3c8" font-size="9" font-weight="500">
					{lang === 'zh' ? '出發' : 'FROM'}
				</text>
				<text x="270" y="58" text-anchor="middle" fill="#9fb3c8" font-size="9" font-weight="500">
					{lang === 'zh' ? '抵達' : 'TO'}
				</text>
			</svg>
		</div>
	</section>

	<!-- ===== CTA BUTTONS ===== -->
	<section class="px-6 -mt-1 relative z-10">
		<div class="mx-auto max-w-md animate-slide-up" style="animation-delay: 240ms;">
			<div class="grid grid-cols-2 gap-3 sm:gap-4">
				<a
					href="/book?type=pickup"
					class="group flex flex-col items-center gap-3 rounded-2xl bg-amber-500 px-4 py-5 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.97]"
				>
					<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 transition-colors group-hover:bg-white/30">
						<PlaneLanding class="h-6 w-6 text-navy-900" strokeWidth={2} />
					</div>
					<span class="text-sm font-bold text-navy-900">
						{lang === 'zh' ? '預約接機' : 'Book Pickup'}
					</span>
				</a>

				<a
					href="/book?type=dropoff"
					class="group flex flex-col items-center gap-3 rounded-2xl bg-amber-500 px-4 py-5 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.97]"
				>
					<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 transition-colors group-hover:bg-white/30">
						<PlaneTakeoff class="h-6 w-6 text-navy-900" strokeWidth={2} />
					</div>
					<span class="text-sm font-bold text-navy-900">
						{lang === 'zh' ? '預約送機' : 'Book Dropoff'}
					</span>
				</a>
			</div>
		</div>
	</section>

	<!-- ===== TRUST SIGNALS ===== -->
	<section class="mt-10 px-6 animate-slide-up" style="animation-delay: 320ms;">
		<div class="mx-auto max-w-md">
			<div class="grid grid-cols-3 gap-3">
				<!-- Licensed Drivers -->
				<div class="flex flex-col items-center gap-2.5 rounded-2xl bg-navy-50 px-3 py-5 text-center">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
						<ShieldCheck class="h-5 w-5 text-teal-600" strokeWidth={2} />
					</div>
					<h3 class="text-sm font-bold text-navy-900">
						{lang === 'zh' ? '合格司機' : 'Licensed'}
					</h3>
					<p class="text-[11px] leading-relaxed text-navy-500">
						{lang === 'zh' ? '所有司機皆持有營業執照' : 'All drivers are professionally licensed'}
					</p>
				</div>

				<!-- Fixed Pricing -->
				<div class="flex flex-col items-center gap-2.5 rounded-2xl bg-navy-50 px-3 py-5 text-center">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
						<BadgeDollarSign class="h-5 w-5 text-amber-600" strokeWidth={2} />
					</div>
					<h3 class="text-sm font-bold text-navy-900">
						{lang === 'zh' ? '固定價格' : 'Fixed Price'}
					</h3>
					<p class="text-[11px] leading-relaxed text-navy-500">
						{lang === 'zh' ? '預訂時確認價格，絕無加價' : 'Price confirmed at booking, no surcharges'}
					</p>
				</div>

				<!-- Flight Tracking -->
				<div class="flex flex-col items-center gap-2.5 rounded-2xl bg-navy-50 px-3 py-5 text-center">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-navy-100">
						<Radar class="h-5 w-5 text-navy-600" strokeWidth={2} />
					</div>
					<h3 class="text-sm font-bold text-navy-900">
						{lang === 'zh' ? '航班追蹤' : 'Flight Track'}
					</h3>
					<p class="text-[11px] leading-relaxed text-navy-500">
						{lang === 'zh' ? '即時監控航班，自動調整接機時間' : 'Live flight monitoring, auto-adjusted pickup'}
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== HOW IT WORKS ===== -->
	<section class="mt-10 px-6 animate-slide-up" style="animation-delay: 400ms;">
		<div class="mx-auto max-w-md">
			<h2 class="mb-6 text-center text-lg font-bold text-navy-900">
				{lang === 'zh' ? '如何預約' : 'How It Works'}
			</h2>

			<div class="relative ml-5">
				<!-- Vertical connecting line -->
				<div class="absolute left-[18px] top-5 h-[calc(100%-40px)] w-0.5 bg-gradient-to-b from-teal-300 via-teal-200 to-teal-100"></div>

				<!-- Step 1 -->
				<div class="relative flex items-start gap-5 pb-8">
					<div class="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white shadow-md shadow-teal-500/30">
						1
					</div>
					<div class="pt-1">
						<div class="flex items-center gap-2">
							<CalendarClock class="h-4.5 w-4.5 text-teal-600" strokeWidth={2} />
							<h3 class="text-sm font-bold text-navy-900">
								{lang === 'zh' ? '選擇機場與時間' : 'Choose Airport & Time'}
							</h3>
						</div>
						<p class="mt-1 text-xs text-navy-500">
							{lang === 'zh' ? '輸入航班資訊與乘車時間' : 'Enter flight info and ride time'}
						</p>
					</div>
				</div>

				<!-- Step 2 -->
				<div class="relative flex items-start gap-5 pb-8">
					<div class="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white shadow-md shadow-teal-500/30">
						2
					</div>
					<div class="pt-1">
						<div class="flex items-center gap-2">
							<Car class="h-4.5 w-4.5 text-teal-600" strokeWidth={2} />
							<h3 class="text-sm font-bold text-navy-900">
								{lang === 'zh' ? '確認車型與價格' : 'Confirm Vehicle & Price'}
							</h3>
						</div>
						<p class="mt-1 text-xs text-navy-500">
							{lang === 'zh' ? '選擇適合的車型，價格透明' : 'Select a vehicle, transparent pricing'}
						</p>
					</div>
				</div>

				<!-- Step 3 -->
				<div class="relative flex items-start gap-5">
					<div class="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white shadow-md shadow-teal-500/30">
						3
					</div>
					<div class="pt-1">
						<div class="flex items-center gap-2">
							<MapPinCheck class="h-4.5 w-4.5 text-teal-600" strokeWidth={2} />
							<h3 class="text-sm font-bold text-navy-900">
								{lang === 'zh' ? '安心出發' : 'Depart with Confidence'}
							</h3>
						</div>
						<p class="mt-1 text-xs text-navy-500">
							{lang === 'zh' ? '司機準時抵達，享受舒適旅程' : 'Driver arrives on time, enjoy the ride'}
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Bottom spacer for tab bar -->
	<div class="pb-28"></div>
</div>
