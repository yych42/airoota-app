<script lang="ts">
	import {
		currentBooking,
		pastBookings,
		upcomingBookings,
		type Booking,
		type BookingState
	} from '$lib/stores/booking';
	import {
		Plane,
		ChevronRight,
		Clock,
		MapPin,
		BookOpen,
		Car,
		User,
		CalendarDays
	} from 'lucide-svelte';

	// Read store values reactively
	let activeBooking: Booking | null = $state(null);
	let upcoming: Booking[] = $state([]);
	let past: Booking[] = $state([]);

	$effect(() => {
		const unsub1 = currentBooking.subscribe((v) => (activeBooking = v));
		const unsub2 = upcomingBookings.subscribe((v) => (upcoming = v));
		const unsub3 = pastBookings.subscribe((v) => (past = v));
		return () => {
			unsub1();
			unsub2();
			unsub3();
		};
	});

	function isActiveTrip(b: Booking | null): boolean {
		return b !== null && b.state !== 'completed';
	}

	let hasActiveTrip = $derived(isActiveTrip(activeBooking));
	let hasAnyContent = $derived(hasActiveTrip || upcoming.length > 0 || past.length > 0);

	function stateLabel(state: BookingState): string {
		const map: Record<BookingState, string> = {
			idle: '閒置',
			pending: '等待配對',
			assigned: '已配對',
			'en-route': '司機出發',
			'in-progress': '行程中',
			completed: '已完成'
		};
		return map[state];
	}

	function stateColor(state: BookingState): string {
		if (state === 'completed') return 'bg-teal-100 text-teal-700';
		if (state === 'in-progress' || state === 'en-route') return 'bg-amber-100 text-amber-700';
		if (state === 'assigned') return 'bg-teal-50 text-teal-700';
		if (state === 'pending') return 'bg-navy-100 text-navy-600';
		return 'bg-navy-50 text-navy-500';
	}

	function formatDate(dateStr: string): { month: string; day: string } {
		const d = new Date(dateStr);
		return { month: `${d.getMonth() + 1}月`, day: `${d.getDate()}` };
	}

	function truncateAddress(addr: string, max: number = 14): string {
		return addr.length > max ? addr.slice(0, max) + '...' : addr;
	}

	function daysUntil(dateStr: string): number {
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		const d = new Date(dateStr);
		d.setHours(0, 0, 0, 0);
		return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
	}

	function daysLabel(dateStr: string): string {
		const days = daysUntil(dateStr);
		if (days === 0) return '今天';
		if (days === 1) return '明天';
		if (days === 2) return '後天';
		return `${days} 天後`;
	}
</script>

<svelte:head>
	<title>我的行程 — AiRoota</title>
</svelte:head>

<div class="page-transition px-4 pt-6 pb-8">
	<h1 class="mb-5 text-2xl font-bold text-navy-900">我的行程</h1>

	{#if !hasAnyContent}
		<!-- Empty state -->
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<div class="relative mb-6">
				<div class="relative h-28 w-36 rounded-xl bg-navy-100">
					<div class="absolute -top-4 left-1/2 h-5 w-14 -translate-x-1/2 rounded-t-lg border-4 border-b-0 border-navy-300"></div>
					<div class="absolute left-1/2 top-1/2 h-full w-4 -translate-x-1/2 -translate-y-1/2 bg-amber-400 opacity-60"></div>
					<div class="absolute bottom-3 left-1/2 h-3 w-5 -translate-x-1/2 rounded-sm bg-amber-500"></div>
					<div class="absolute -bottom-2 left-4 h-3 w-3 rounded-full bg-navy-300"></div>
					<div class="absolute -bottom-2 right-4 h-3 w-3 rounded-full bg-navy-300"></div>
				</div>
				<div class="absolute -right-4 -top-6 text-navy-300">
					<Plane size={28} strokeWidth={1.5} class="-rotate-12" />
				</div>
			</div>

			<h2 class="mb-2 text-lg font-semibold text-navy-800">您的第一趟旅程正等著您</h2>
			<p class="mb-6 text-sm text-navy-400">預訂機場接送，享受輕鬆旅程</p>

			<a
				href="/book?type=pickup"
				class="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-200/50 transition hover:bg-amber-600 active:scale-[0.97]"
			>
				立即預訂
				<ChevronRight size={18} />
			</a>
		</div>
	{:else}
		<!-- ===== ACTIVE TRIP (from booking flow) ===== -->
		{#if hasActiveTrip && activeBooking}
			<a
				href="/trips/active"
				class="mb-6 block rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 p-4 shadow-lg shadow-navy-200/40 transition-transform active:scale-[0.98]"
			>
				<div class="mb-2 flex items-center gap-2">
					<div class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
						<div class="h-2 w-2 animate-pulse rounded-full bg-white"></div>
					</div>
					<span class="text-xs font-semibold tracking-wide text-amber-400 uppercase">進行中</span>
					<ChevronRight size={14} class="ml-auto text-navy-300" />
				</div>
				<div class="flex items-end justify-between">
					<div>
						<p class="text-lg font-bold text-white">
							{activeBooking.airport.code}
							<span class="mx-1.5 text-navy-400">&rarr;</span>
							{truncateAddress(activeBooking.address, 10)}
						</p>
						<p class="mt-1 text-xs text-navy-300">
							{activeBooking.date} &middot; {activeBooking.time}
						</p>
					</div>
					<span class="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
						{stateLabel(activeBooking.state)}
					</span>
				</div>
			</a>
		{/if}

		<!-- ===== UPCOMING TRIPS ===== -->
		{#if upcoming.length > 0}
			<h2 class="mb-3 text-sm font-semibold text-navy-500 uppercase tracking-wide">即將到來</h2>

			<div class="mb-6 flex flex-col gap-3">
				{#each upcoming as trip (trip.id)}
					<div class="rounded-2xl border border-navy-100 bg-white shadow-sm overflow-hidden">
						<!-- Trip card -->
						<a
							href="/trips/{trip.id}"
							class="flex items-center gap-3 p-4 transition hover:bg-navy-50/30 active:bg-navy-50/50"
						>
							<!-- Date badge -->
							<div class="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
								<span class="text-[10px] font-semibold text-amber-600">
									{formatDate(trip.date).month}
								</span>
								<span class="text-xl font-bold leading-tight text-amber-800">
									{formatDate(trip.date).day}
								</span>
							</div>

							<!-- Trip info -->
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-1.5">
									<span class="font-bold text-navy-900">{trip.airport.code}</span>
									<span class="text-xs text-navy-300">
										{trip.tripType === 'pickup' ? '&rarr;' : '&larr;'}
									</span>
									<span class="truncate text-sm text-navy-600">
										{truncateAddress(trip.address)}
									</span>
								</div>
								<div class="mt-1 flex items-center gap-2 text-xs text-navy-400">
									<Clock size={12} />
									<span>{trip.time}</span>
									<span>&middot;</span>
									<span class="text-amber-600 font-medium">{daysLabel(trip.date)}</span>
									{#if trip.driver}
										<span>&middot;</span>
										<span class="flex items-center gap-1 text-teal-600">
											<Car size={10} />
											{trip.driver.name}
										</span>
									{/if}
								</div>
							</div>

							<!-- Status + arrow -->
							<div class="flex flex-col items-end gap-1.5">
								<span class="rounded-full px-2.5 py-0.5 text-[11px] font-medium {stateColor(trip.state)}">
									{stateLabel(trip.state)}
								</span>
								<ChevronRight size={14} class="text-navy-300" />
							</div>
						</a>

						<!-- Airport guide link — tied to this trip -->
						<a
							href="/guides/{trip.airport.code.toLowerCase()}"
							class="flex items-center gap-2.5 border-t border-navy-100 bg-navy-50/40 px-4 py-2.5 transition hover:bg-navy-50 active:bg-navy-100"
						>
							<BookOpen size={14} class="text-teal-600" />
							<span class="text-xs font-medium text-teal-700">
								查看{trip.airport.nameZh}接機指南
							</span>
							<ChevronRight size={12} class="ml-auto text-navy-300" />
						</a>
					</div>
				{/each}
			</div>
		{/if}

		<!-- ===== PAST TRIPS ===== -->
		{#if past.length > 0}
			<h2 class="mb-3 text-sm font-semibold text-navy-500 uppercase tracking-wide">歷史行程</h2>

			<div class="flex flex-col gap-3">
				{#each past as trip (trip.id)}
					<div class="rounded-2xl border border-navy-100 bg-white shadow-sm overflow-hidden">
						<a
							href="/trips/{trip.id}"
							class="flex items-center gap-3 p-3.5 transition hover:bg-navy-50/30 active:bg-navy-50/50"
						>
							<!-- Date circle -->
							<div class="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-navy-50">
								<span class="text-[10px] font-medium text-navy-400">
									{formatDate(trip.date).month}
								</span>
								<span class="text-lg font-bold leading-tight text-navy-800">
									{formatDate(trip.date).day}
								</span>
							</div>

							<!-- Trip details -->
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-1.5">
									<span class="font-semibold text-navy-900">{trip.airport.code}</span>
									<span class="text-xs text-navy-300">
										{trip.tripType === 'pickup' ? '&rarr;' : '&larr;'}
									</span>
									<span class="truncate text-sm text-navy-600">
										{truncateAddress(trip.address)}
									</span>
								</div>
								<div class="mt-1 flex items-center gap-2 text-xs text-navy-400">
									<Clock size={12} />
									<span>{trip.time}</span>
									<span>&middot;</span>
									<span>TWD {trip.price.toLocaleString()}</span>
									{#if trip.driver}
										<span>&middot;</span>
										<span class="flex items-center gap-1">
											<User size={10} />
											{trip.driver.name}
										</span>
									{/if}
								</div>
							</div>

							<!-- Status badge -->
							<span class="flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium {stateColor(trip.state)}">
								{stateLabel(trip.state)}
							</span>
						</a>

						<!-- Airport guide link — tied to this trip -->
						{#if trip.tripType === 'pickup'}
							<a
								href="/guides/{trip.airport.code.toLowerCase()}"
								class="flex items-center gap-2.5 border-t border-navy-100 bg-navy-50/30 px-4 py-2 transition hover:bg-navy-50 active:bg-navy-100"
							>
								<BookOpen size={13} class="text-navy-400" />
								<span class="text-xs text-navy-500">
									{trip.airport.nameZh}指南
								</span>
								<ChevronRight size={12} class="ml-auto text-navy-300" />
							</a>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
