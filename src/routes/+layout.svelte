<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
</svelte:head>

<!-- Mobile phone frame wrapper -->
<div class="relative mx-auto flex min-h-dvh max-w-[430px] flex-col bg-white shadow-[0_0_40px_rgba(0,0,0,0.08)]">
	<!-- Scrollable content area -->
	<main class="flex-1 overflow-y-auto pb-20">
		{@render children()}
	</main>

	<!-- Bottom tab bar -->
	<BottomNav currentPath={page.url.pathname} />
</div>
