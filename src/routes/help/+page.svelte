<script lang="ts">
	import {
		ChevronLeft,
		Search,
		Phone,
		MessageSquare,
		ClipboardList,
		RefreshCw,
		ChevronDown
	} from 'lucide-svelte';

	// ── Accordion state ───────────────────────────────
	let openSection = $state<number | null>(null);
	let openQuestion = $state<string | null>(null);

	function toggleSection(index: number) {
		if (openSection === index) {
			openSection = null;
			openQuestion = null;
		} else {
			openSection = index;
			openQuestion = null;
		}
	}

	function toggleQuestion(id: string) {
		openQuestion = openQuestion === id ? null : id;
	}

	// ── Quick action cards ────────────────────────────
	const quickActions = [
		{
			icon: Phone,
			label: '聯繫客服',
			desc: '即時線上客服',
			bg: 'bg-teal-500/10',
			iconColor: 'text-teal-600'
		},
		{
			icon: MessageSquare,
			label: '常見問題',
			desc: '查看熱門問答',
			bg: 'bg-amber-500/10',
			iconColor: 'text-amber-600'
		},
		{
			icon: ClipboardList,
			label: '訂單問題',
			desc: '行程與付款疑問',
			bg: 'bg-navy-900/10',
			iconColor: 'text-navy-700'
		},
		{
			icon: RefreshCw,
			label: '取消與退款',
			desc: '取消政策說明',
			bg: 'bg-red-500/10',
			iconColor: 'text-red-500'
		}
	] as const;

	// ── FAQ data ──────────────────────────────────────
	const faqSections = [
		{
			title: '預訂相關',
			questions: [
				{
					id: 'booking-1',
					q: '如何預訂機場接送？',
					a: '在首頁選擇「預約接機」或「預約送機」，依照步驟填寫行程資訊、選擇車型並確認付款即可完成預訂。'
				},
				{
					id: 'booking-2',
					q: '可以預訂多遠的行程？',
					a: '您可以預訂最早 3 個月內的行程。建議至少在出發前 24 小時預訂，以確保司機安排。'
				},
				{
					id: 'booking-3',
					q: '價格如何計算？',
					a: '價格在預訂時即確認，包含車資、過路費及免費等候時間。不會有額外隱藏費用。'
				}
			]
		},
		{
			title: '行程相關',
			questions: [
				{
					id: 'trip-1',
					q: '司機會等我多久？',
					a: '國際航班免費等候 90 分鐘，國內航班免費等候 60 分鐘，從航班實際降落時間起算。'
				},
				{
					id: 'trip-2',
					q: '如果航班延誤怎麼辦？',
					a: '我們會即時追蹤您的航班，司機會自動調整接機時間。您不需要做任何操作。'
				},
				{
					id: 'trip-3',
					q: '如何聯繫我的司機？',
					a: '司機確認後，您可以在行程詳情頁面透過「傳送訊息」或「撥打電話」直接聯繫司機。'
				}
			]
		},
		{
			title: '付款與發票',
			questions: [
				{
					id: 'payment-1',
					q: '支援哪些付款方式？',
					a: '目前支援信用卡、Apple Pay 和 LINE Pay。'
				},
				{
					id: 'payment-2',
					q: '如何取得統一發票？',
					a: '預訂時選擇「需要統一發票」，司機會在行程結束時提供紙本發票。'
				}
			]
		},
		{
			title: '取消與退款',
			questions: [
				{
					id: 'cancel-1',
					q: '取消政策是什麼？',
					a: '出發前 24 小時取消可全額退款。出發前 12-24 小時取消收取 30% 手續費。出發前 12 小時內取消不予退款。'
				},
				{
					id: 'cancel-2',
					q: '退款需要多久？',
					a: '退款將在 3-5 個工作天內退回原付款方式。'
				}
			]
		},
		{
			title: '兒童安全座椅',
			questions: [
				{
					id: 'child-1',
					q: '兒童安全座椅如何申請？',
					a: '在預訂時的「兒童安全座椅」區域選擇所需的座椅類型。我們提供後向式（0-1歲）、前向式（1-3歲）及增高墊（3-8歲）。'
				},
				{
					id: 'child-2',
					q: '安全座椅費用多少？',
					a: '每張安全座椅加收 TWD 200。'
				}
			]
		}
	];
</script>

<svelte:head>
	<title>客服中心 — AiRoota</title>
	<meta name="description" content="AiRoota 客服中心，我們隨時為您提供協助" />
</svelte:head>

<div class="page-transition min-h-screen bg-white">
	<!-- ═══════════════════════════════════════════════ -->
	<!-- Header                                         -->
	<!-- ═══════════════════════════════════════════════ -->
	<section class="bg-gradient-to-b from-navy-900 via-navy-800 to-navy-700 px-6 pb-10 pt-6">
		<div class="flex items-center gap-3">
			<a
				href="/profile"
				class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition-colors active:bg-white/20"
			>
				<ChevronLeft size={20} strokeWidth={2.5} />
			</a>
			<div>
				<h1 class="text-xl font-bold tracking-tight text-white">客服中心</h1>
				<p class="mt-0.5 text-sm font-medium text-navy-300">我們隨時為您提供協助</p>
			</div>
		</div>
	</section>

	<!-- Content body -->
	<div class="px-5 -mt-4 relative z-10 space-y-6">

		<!-- ═══════════════════════════════════════════ -->
		<!-- Search Bar (visual only)                    -->
		<!-- ═══════════════════════════════════════════ -->
		<div class="relative">
			<div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
				<Search class="h-4.5 w-4.5 text-navy-400" strokeWidth={2.2} />
			</div>
			<input
				type="text"
				placeholder="搜尋常見問題..."
				readonly
				class="w-full cursor-default rounded-xl border border-navy-100/80 bg-navy-50 py-3.5 pl-11 pr-4 text-sm font-medium text-navy-900 placeholder:text-navy-400 shadow-sm focus:outline-none"
			/>
		</div>

		<!-- ═══════════════════════════════════════════ -->
		<!-- Quick Action Cards (2x2)                    -->
		<!-- ═══════════════════════════════════════════ -->
		<div class="grid grid-cols-2 gap-3">
			{#each quickActions as action}
				<button
					class="flex flex-col items-start gap-3 rounded-2xl border border-navy-100/80 bg-white p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
				>
					<div class="flex h-11 w-11 items-center justify-center rounded-xl {action.bg}">
						<action.icon class="h-5 w-5 {action.iconColor}" strokeWidth={2} />
					</div>
					<div class="text-left">
						<p class="text-sm font-bold text-navy-900">{action.label}</p>
						<p class="mt-0.5 text-xs text-navy-400">{action.desc}</p>
					</div>
				</button>
			{/each}
		</div>

		<!-- ═══════════════════════════════════════════ -->
		<!-- FAQ Accordion Sections                      -->
		<!-- ═══════════════════════════════════════════ -->
		<div class="space-y-3">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-navy-400">常見問題</h2>

			{#each faqSections as section, sIdx}
				<div class="overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-sm">
					<!-- Section header -->
					<button
						onclick={() => toggleSection(sIdx)}
						class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-navy-50/30"
					>
						<span class="text-[15px] font-bold text-navy-900">{section.title}</span>
						<ChevronDown
							class="h-4.5 w-4.5 text-navy-400 transition-transform duration-200 {openSection === sIdx ? 'rotate-180' : ''}"
							strokeWidth={2.5}
						/>
					</button>

					<!-- Questions (shown when section is open) -->
					{#if openSection === sIdx}
						<div class="border-t border-navy-100">
							{#each section.questions as question, qIdx}
								{@const isOpen = openQuestion === question.id}
								<div class="{qIdx > 0 ? 'border-t border-navy-50' : ''}">
									<!-- Question -->
									<button
										onclick={() => toggleQuestion(question.id)}
										class="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-navy-50/30"
									>
										<span class="pr-4 text-sm font-semibold text-navy-700">{question.q}</span>
										<ChevronDown
											class="h-4 w-4 flex-shrink-0 text-navy-300 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
											strokeWidth={2.5}
										/>
									</button>

									<!-- Answer -->
									{#if isOpen}
										<div class="px-5 pb-4 pt-0">
											<p class="text-sm leading-relaxed text-navy-500">{question.a}</p>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- ═══════════════════════════════════════════ -->
		<!-- Bottom Contact Section                      -->
		<!-- ═══════════════════════════════════════════ -->
		<div class="rounded-2xl border border-navy-100/80 bg-navy-50/50 px-5 py-6 text-center">
			<h3 class="text-base font-bold text-navy-900">還是找不到答案？</h3>

			<button
				class="mt-4 w-full rounded-xl bg-amber-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-600 active:scale-[0.98]"
			>
				聯繫客服
			</button>

			<p class="mt-4 text-xs text-navy-400">服務時間：每日 06:00 - 24:00</p>
			<p class="mt-1 text-xs font-medium text-navy-500">客服專線：0800-000-123</p>
		</div>
	</div>

	<!-- Bottom spacer for tab bar -->
	<div class="pb-28"></div>
</div>
