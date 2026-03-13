<script lang="ts">
	import {
		CreditCard,
		Globe,
		Bell,
		Headphones,
		Info,
		LogOut,
		ChevronRight,
		Plus,
		Check
	} from 'lucide-svelte';

	let notificationsEnabled = $state(true);
	let selectedLang = $state<'zh' | 'en'>('zh');

	const user = {
		initial: '王',
		name: '王小明',
		phone: '+886 912-345-678'
	};

	function toggleNotifications() {
		notificationsEnabled = !notificationsEnabled;
	}

	function selectLang(lang: 'zh' | 'en') {
		selectedLang = lang;
	}
</script>

<svelte:head>
	<title>個人資料 — AiRoota</title>
	<meta name="description" content="管理您的個人資料與偏好設定" />
</svelte:head>

<div class="min-h-screen bg-white">
	<!-- Profile header -->
	<section class="bg-gradient-to-b from-navy-900 via-navy-800 to-navy-700 px-6 pb-10 pt-8">
		<div class="flex flex-col items-center">
			<!-- Avatar -->
			<div class="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 ring-4 ring-amber-400/30">
				<span class="text-2xl font-bold text-amber-400">{user.initial}</span>
			</div>
			<!-- Name & phone -->
			<h1 class="mt-4 text-xl font-bold text-white">{user.name}</h1>
			<p class="mt-1 text-sm text-navy-300">{user.phone}</p>
		</div>
	</section>

	<!-- Settings sections -->
	<div class="px-5 -mt-4 relative z-10 space-y-4">

		<!-- Payment Methods -->
		<div class="rounded-2xl border border-navy-100/80 bg-white shadow-sm overflow-hidden">
			<div class="px-5 py-4">
				<h2 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
					<CreditCard class="h-3.5 w-3.5" strokeWidth={2.2} />
					付款方式
				</h2>
			</div>

			<!-- Existing card -->
			<div class="flex items-center gap-4 border-t border-navy-50 px-5 py-4">
				<div class="flex h-10 w-14 items-center justify-center rounded-lg bg-navy-900">
					<span class="text-[10px] font-bold tracking-wider text-white">VISA</span>
				</div>
				<div class="flex-1">
					<p class="text-sm font-semibold text-navy-900">**** **** **** 4242</p>
					<p class="mt-0.5 text-xs text-navy-400">到期日 12/27</p>
				</div>
				<div class="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100">
					<Check class="h-3.5 w-3.5 text-teal-600" strokeWidth={3} />
				</div>
			</div>

			<!-- Add new payment -->
			<button class="flex w-full items-center gap-3 border-t border-navy-50 px-5 py-4 text-left transition-colors hover:bg-navy-50/50 active:bg-navy-50">
				<div class="flex h-10 w-14 items-center justify-center rounded-lg border-2 border-dashed border-navy-200">
					<Plus class="h-4 w-4 text-navy-400" strokeWidth={2.5} />
				</div>
				<span class="text-sm font-medium text-amber-600">新增付款方式</span>
			</button>
		</div>

		<!-- Language setting -->
		<div class="rounded-2xl border border-navy-100/80 bg-white shadow-sm overflow-hidden">
			<div class="px-5 py-4">
				<h2 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
					<Globe class="h-3.5 w-3.5" strokeWidth={2.2} />
					語言設定
				</h2>
			</div>

			<div class="flex gap-3 border-t border-navy-50 px-5 py-4">
				<button
					onclick={() => selectLang('zh')}
					class="flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition-all
						{selectedLang === 'zh'
							? 'bg-navy-900 text-white shadow-md shadow-navy-900/20'
							: 'bg-navy-50 text-navy-500 hover:bg-navy-100'}"
				>
					繁體中文
				</button>
				<button
					onclick={() => selectLang('en')}
					class="flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition-all
						{selectedLang === 'en'
							? 'bg-navy-900 text-white shadow-md shadow-navy-900/20'
							: 'bg-navy-50 text-navy-500 hover:bg-navy-100'}"
				>
					English
				</button>
			</div>
		</div>

		<!-- Notifications -->
		<div class="rounded-2xl border border-navy-100/80 bg-white shadow-sm overflow-hidden">
			<button
				onclick={toggleNotifications}
				class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-navy-50/30"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50">
						<Bell class="h-4.5 w-4.5 text-navy-600" strokeWidth={2} />
					</div>
					<span class="text-[15px] font-semibold text-navy-900">通知設定</span>
				</div>

				<!-- Toggle switch -->
				<div
					class="relative h-7 w-12 rounded-full transition-colors duration-200
						{notificationsEnabled ? 'bg-teal-500' : 'bg-navy-200'}"
				>
					<div
						class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200
							{notificationsEnabled ? 'translate-x-[22px]' : 'translate-x-0'}"
					></div>
				</div>
			</button>
		</div>

		<!-- Links section -->
		<div class="rounded-2xl border border-navy-100/80 bg-white shadow-sm overflow-hidden">
			<!-- Help Center -->
			<a
				href="/help"
				class="flex items-center justify-between px-5 py-4 transition-colors hover:bg-navy-50/30 active:bg-navy-50"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50">
						<Headphones class="h-4.5 w-4.5 text-navy-600" strokeWidth={2} />
					</div>
					<span class="text-[15px] font-semibold text-navy-900">客服中心</span>
				</div>
				<ChevronRight class="h-4.5 w-4.5 text-navy-300" strokeWidth={2.5} />
			</a>

			<!-- About Us -->
			<a
				href="/about"
				class="flex items-center justify-between border-t border-navy-50 px-5 py-4 transition-colors hover:bg-navy-50/30 active:bg-navy-50"
			>
				<div class="flex items-center gap-3">
					<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50">
						<Info class="h-4.5 w-4.5 text-navy-600" strokeWidth={2} />
					</div>
					<span class="text-[15px] font-semibold text-navy-900">關於我們</span>
				</div>
				<ChevronRight class="h-4.5 w-4.5 text-navy-300" strokeWidth={2.5} />
			</a>
		</div>

		<!-- Sign Out -->
		<div>
			<button class="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50/50 px-5 py-4 transition-colors hover:bg-red-50 active:bg-red-100">
				<LogOut class="h-4.5 w-4.5 text-red-500" strokeWidth={2.2} />
				<span class="text-[15px] font-semibold text-red-500">登出</span>
			</button>
		</div>

	</div>

	<!-- Bottom spacer for tab bar -->
	<div class="pb-28"></div>
</div>
