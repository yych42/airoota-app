<script lang="ts">
	import { Home, CalendarDays, User } from 'lucide-svelte';

	let { currentPath = '/' }: { currentPath?: string } = $props();

	const tabs = [
		{ href: '/', label: '首頁', icon: Home },
		{ href: '/trips', label: '我的行程', icon: CalendarDays },
		{ href: '/profile', label: '個人資料', icon: User }
	] as const;

	function isActive(tabHref: string, path: string): boolean {
		if (tabHref === '/') return path === '/';
		return path.startsWith(tabHref);
	}
</script>

<nav
	class="absolute bottom-0 left-0 right-0 z-50 border-t border-navy-100 bg-white/95 backdrop-blur-md"
>
	<div class="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
		{#each tabs as tab (tab.href)}
			{@const active = isActive(tab.href, currentPath)}
			<a
				href={tab.href}
				class="group flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors duration-200
					{active ? 'text-amber-500' : 'text-navy-400 hover:text-navy-600'}"
			>
				<div class="relative flex items-center justify-center">
					{#if active}
						<div
							class="absolute -inset-2 rounded-full bg-amber-50 transition-transform duration-200"
						></div>
					{/if}
					<tab.icon size={22} strokeWidth={active ? 2.5 : 2} class="relative" />
				</div>
				<span class="text-[10px] font-medium leading-tight {active ? 'font-semibold' : ''}">
					{tab.label}
				</span>
			</a>
		{/each}
	</div>
</nav>
