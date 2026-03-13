<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentBooking } from '$lib/stores/booking';
	import { get } from 'svelte/store';
	import {
		Check,
		Plane,
		Car,
		MapPin,
		Calendar,
		Clock,
		Briefcase,
		ChevronRight
	} from 'lucide-svelte';

	const booking = get(currentBooking);

	function formatPrice(price: number): string {
		return `TWD ${price.toLocaleString()}`;
	}

	function formatDate(d: string): string {
		if (!d) return '';
		const dt = new Date(d + 'T00:00:00');
		return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
	}
</script>

<svelte:head>
	<title>預訂成功 — Airoota</title>
</svelte:head>

<div class="page-transition relative min-h-[calc(100dvh-5rem)] overflow-hidden px-4 pt-8 pb-8">
	<!-- Celebration particles -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		{#each Array(12) as _, i}
			<div
				class="absolute h-2 w-2 rounded-full opacity-0"
				style="
					left: {10 + (i * 7.5)}%;
					top: {5 + ((i * 13) % 40)}%;
					background: {['#f0b429', '#27ab83', '#f7c948', '#65d6ad', '#fce588', '#8eedc7'][i % 6]};
					animation: confetti-fall {1.5 + (i * 0.15)}s ease-out {i * 0.1}s forwards;
				"
			></div>
		{/each}
	</div>

	<!-- Main Content -->
	<div class="relative flex flex-col items-center">
		<!-- Success Checkmark -->
		<div class="check-container mb-6">
			<div
				class="flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 shadow-xl shadow-teal-500/30"
				style="animation: scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;"
			>
				<Check
					size={48}
					strokeWidth={3}
					class="text-white"
					style="animation: check-draw 0.4s ease-out 0.3s both;"
				/>
			</div>
		</div>

		<!-- Success Text -->
		<h1
			class="mb-2 text-2xl font-bold text-navy-900"
			style="animation: fade-up 0.4s ease-out 0.4s both;"
		>
			預訂成功！
		</h1>
		<p
			class="mb-8 max-w-[260px] text-center text-sm leading-relaxed text-navy-500"
			style="animation: fade-up 0.4s ease-out 0.5s both;"
		>
			您的司機將在 2 小時內確認。我們會發送通知給您。
		</p>

		<!-- Trip Summary (if booking exists) -->
		{#if booking}
			<div
				class="mb-6 w-full rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"
				style="animation: fade-up 0.4s ease-out 0.6s both;"
			>
				<div class="mb-3 flex items-center gap-2">
					<span class="text-xs font-semibold text-navy-400">行程摘要</span>
					<div class="h-px flex-1 bg-navy-100"></div>
				</div>

				<div class="space-y-3">
					<!-- Trip Type + Airport -->
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy-50">
							<Plane size={16} class="text-navy-500" />
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-xs text-navy-400">
								{booking.tripType === 'pickup' ? '接機' : '送機'}
							</p>
							<p class="truncate text-sm font-semibold text-navy-900">
								{booking.airport.code} — {booking.airport.nameZh}
							</p>
						</div>
					</div>

					<!-- Address -->
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy-50">
							<MapPin size={16} class="text-navy-500" />
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-xs text-navy-400">
								{booking.tripType === 'pickup' ? '目的地' : '出發地'}
							</p>
							<p class="truncate text-sm font-semibold text-navy-900">{booking.address}</p>
						</div>
					</div>

					<!-- Date & Time -->
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy-50">
							<Calendar size={16} class="text-navy-500" />
						</div>
						<div>
							<p class="text-xs text-navy-400">日期與時間</p>
							<p class="text-sm font-semibold text-navy-900">
								{formatDate(booking.date)} · {booking.time}
							</p>
						</div>
					</div>

					<!-- Vehicle & Price -->
					<div class="border-t border-navy-100 pt-3">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
									<Car size={16} class="text-amber-600" />
								</div>
								<div>
									<p class="text-sm font-bold text-navy-900">{booking.vehicle.nameZh}</p>
									<p class="text-xs text-navy-400">
										{booking.vehicle.maxPassengers} 位乘客 · {booking.vehicle.maxLuggage} 件行李
									</p>
								</div>
							</div>
							<p class="text-base font-bold text-amber-600">{formatPrice(booking.price)}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Action Buttons -->
		<div
			class="w-full space-y-3"
			style="animation: fade-up 0.4s ease-out 0.7s both;"
		>
			<button
				onclick={() => goto('/trips/active')}
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-navy-800 active:scale-[0.98]"
			>
				查看行程詳情
				<ChevronRight size={18} />
			</button>
			<button
				onclick={() => goto('/')}
				class="w-full rounded-xl border border-navy-200 px-6 py-3.5 text-sm font-semibold text-navy-600 transition-all hover:bg-navy-50 active:scale-[0.98]"
			>
				返回首頁
			</button>
		</div>
	</div>
</div>

<style>
	@keyframes scale-in {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes check-draw {
		0% {
			opacity: 0;
			transform: scale(0.5);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes fade-up {
		0% {
			opacity: 0;
			transform: translateY(16px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes confetti-fall {
		0% {
			opacity: 0;
			transform: translateY(-20px) scale(0);
		}
		30% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateY(60px) scale(0.5) rotate(180deg);
		}
	}
</style>
