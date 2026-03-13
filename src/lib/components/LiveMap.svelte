<script lang="ts">
	import { onMount } from 'svelte';
	import type L from 'leaflet';

	interface Props {
		driverLat: number;
		driverLng: number;
		destLat: number;
		destLng: number;
		driverLabel?: string;
		destLabel?: string;
		routeColor?: string;
		animateDriver?: boolean;
	}

	let {
		driverLat,
		driverLng,
		destLat,
		destLng,
		driverLabel = '司機',
		destLabel = '目的地',
		routeColor = '#f0b429',
		animateDriver = true
	}: Props = $props();

	let mapEl: HTMLDivElement;
	let map: L.Map | null = null;
	let driverMarker: L.Marker | null = null;
	let routeLine: L.Polyline | null = null;

	// Generate a curved route between two points (mock waypoints)
	function generateRoute(
		startLat: number, startLng: number,
		endLat: number, endLng: number
	): [number, number][] {
		const points: [number, number][] = [];
		const steps = 30;
		const midLat = (startLat + endLat) / 2;
		const midLng = (startLng + endLng) / 2;
		// Offset the midpoint to create a curve
		const offsetLat = (endLng - startLng) * 0.15;
		const offsetLng = -(endLat - startLat) * 0.15;

		for (let i = 0; i <= steps; i++) {
			const t = i / steps;
			// Quadratic bezier
			const lat = (1 - t) * (1 - t) * startLat + 2 * (1 - t) * t * (midLat + offsetLat) + t * t * endLat;
			const lng = (1 - t) * (1 - t) * startLng + 2 * (1 - t) * t * (midLng + offsetLng) + t * t * endLng;
			points.push([lat, lng]);
		}
		return points;
	}

	onMount(() => {
		let cleanup: (() => void) | undefined;

		(async () => {
		const leaflet = await import('leaflet');

		// Create map
		map = leaflet.map(mapEl, {
			zoomControl: false,
			attributionControl: false,
			dragging: true,
			scrollWheelZoom: false,
			doubleClickZoom: false,
			touchZoom: true
		});

		// Use CartoDB Voyager tiles (clean, modern look, free)
		leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
			maxZoom: 18,
			subdomains: 'abcd'
		}).addTo(map);

		// Custom driver icon
		const driverIcon = leaflet.divIcon({
			className: '',
			html: `<div style="
				width: 40px; height: 40px;
				background: #102a43;
				border-radius: 50%;
				display: flex; align-items: center; justify-content: center;
				box-shadow: 0 2px 8px rgba(16,42,67,0.4);
				border: 3px solid white;
				font-size: 18px;
			">🚗</div>`,
			iconSize: [40, 40],
			iconAnchor: [20, 20]
		});

		// Custom destination icon
		const destIcon = leaflet.divIcon({
			className: '',
			html: `<div style="
				width: 36px; height: 36px;
				background: ${routeColor === '#27ab83' ? '#27ab83' : '#f0b429'};
				border-radius: 50%;
				display: flex; align-items: center; justify-content: center;
				box-shadow: 0 2px 8px rgba(0,0,0,0.3);
				border: 3px solid white;
			">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
					<circle cx="12" cy="10" r="3"/>
				</svg>
			</div>`,
			iconSize: [36, 36],
			iconAnchor: [18, 18]
		});

		// Add route line
		const routePoints = generateRoute(driverLat, driverLng, destLat, destLng);
		routeLine = leaflet.polyline(routePoints, {
			color: routeColor,
			weight: 4,
			opacity: 0.8,
			dashArray: '10, 6',
			lineCap: 'round'
		}).addTo(map);

		// Add destination marker
		leaflet.marker([destLat, destLng], { icon: destIcon })
			.addTo(map)
			.bindTooltip(destLabel, {
				permanent: true,
				direction: 'top',
				offset: [0, -22],
				className: 'map-tooltip'
			});

		// Add driver marker
		driverMarker = leaflet.marker([driverLat, driverLng], { icon: driverIcon })
			.addTo(map)
			.bindTooltip(driverLabel, {
				permanent: true,
				direction: 'top',
				offset: [0, -24],
				className: 'map-tooltip'
			});

		// Fit bounds to show both markers
		const bounds = leaflet.latLngBounds(
			[driverLat, driverLng],
			[destLat, destLng]
		);
		map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

		// Animate driver along route
		if (animateDriver && routePoints.length > 0) {
			let idx = 0;
			const direction = { forward: true };
			const interval = setInterval(() => {
				if (!driverMarker) return;
				if (direction.forward) {
					idx++;
					if (idx >= routePoints.length - 1) direction.forward = false;
				} else {
					idx--;
					if (idx <= 0) direction.forward = true;
				}
				const point = routePoints[idx];
				driverMarker.setLatLng(point);
			}, 200);

			cleanup = () => {
				clearInterval(interval);
				map?.remove();
			};
		} else {
			cleanup = () => {
				map?.remove();
			};
		}
		})();

		return () => {
			cleanup?.();
		};
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
	{@html `<style>
		.map-tooltip {
			background: #102a43 !important;
			color: white !important;
			border: none !important;
			border-radius: 8px !important;
			padding: 4px 10px !important;
			font-size: 11px !important;
			font-weight: 600 !important;
			font-family: 'Inter', 'Noto Sans TC', sans-serif !important;
			box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
		}
		.map-tooltip::before {
			border-top-color: #102a43 !important;
		}
	</style>`}
</svelte:head>

<div bind:this={mapEl} class="h-full w-full" style="min-height: 200px;"></div>
