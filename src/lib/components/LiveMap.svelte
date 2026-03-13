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
		/** How far along the route the driver is (0 to 1) */
		driverProgress?: number;
	}

	let {
		driverLat,
		driverLng,
		destLat,
		destLng,
		driverLabel = '司機',
		destLabel = '目的地',
		routeColor = '#f0b429',
		animateDriver = true,
		driverProgress = 0.15
	}: Props = $props();

	let mapEl: HTMLDivElement;
	let map: L.Map | null = null;
	let driverMarker: L.Marker | null = null;

	onMount(() => {
		let cleanup: (() => void) | undefined;

		(async () => {
			const leaflet = await import('leaflet');

			map = leaflet.map(mapEl, {
				zoomControl: false,
				attributionControl: false,
				dragging: true,
				scrollWheelZoom: false,
				doubleClickZoom: false,
				touchZoom: true
			});

			leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
				maxZoom: 18,
				subdomains: 'abcd'
			}).addTo(map);

			// Fetch real road route from OSRM
			let routePoints: [number, number][] = [];
			try {
				const res = await fetch(
					`https://router.project-osrm.org/route/v1/driving/${driverLng},${driverLat};${destLng},${destLat}?overview=full&geometries=geojson`
				);
				const data = await res.json();
				if (data.routes && data.routes.length > 0) {
					// GeoJSON coordinates are [lng, lat], Leaflet needs [lat, lng]
					routePoints = data.routes[0].geometry.coordinates.map(
						(c: [number, number]) => [c[1], c[0]] as [number, number]
					);
				}
			} catch {
				// Fallback: straight line if OSRM fails
				routePoints = [[driverLat, driverLng], [destLat, destLng]];
			}

			// Draw the full route as a faded background line
			if (routePoints.length > 0) {
				leaflet.polyline(routePoints, {
					color: routeColor,
					weight: 5,
					opacity: 0.25,
					lineCap: 'round',
					lineJoin: 'round'
				}).addTo(map);

				// Draw the "already traveled" portion as a solid line
				const progressIdx = Math.floor(routePoints.length * driverProgress);
				const traveledPoints = routePoints.slice(0, Math.max(progressIdx, 1));
				if (traveledPoints.length > 1) {
					leaflet.polyline(traveledPoints, {
						color: routeColor,
						weight: 5,
						opacity: 0.8,
						lineCap: 'round',
						lineJoin: 'round'
					}).addTo(map);
				}

				// Draw the remaining portion as a dashed line
				const remainingPoints = routePoints.slice(Math.max(progressIdx - 1, 0));
				if (remainingPoints.length > 1) {
					leaflet.polyline(remainingPoints, {
						color: routeColor,
						weight: 4,
						opacity: 0.6,
						dashArray: '8, 8',
						lineCap: 'round',
						lineJoin: 'round'
					}).addTo(map);
				}
			}

			// Custom driver icon
			const driverIcon = leaflet.divIcon({
				className: '',
				html: `<div style="
					width: 44px; height: 44px;
					background: #102a43;
					border-radius: 50%;
					display: flex; align-items: center; justify-content: center;
					box-shadow: 0 3px 12px rgba(16,42,67,0.5);
					border: 3px solid white;
					font-size: 20px;
				">🚗</div>`,
				iconSize: [44, 44],
				iconAnchor: [22, 22]
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

			// Origin icon (start of route)
			const originIcon = leaflet.divIcon({
				className: '',
				html: `<div style="
					width: 16px; height: 16px;
					background: ${routeColor};
					border-radius: 50%;
					border: 3px solid white;
					box-shadow: 0 2px 6px rgba(0,0,0,0.25);
				"></div>`,
				iconSize: [16, 16],
				iconAnchor: [8, 8]
			});

			// Add origin marker (start point)
			leaflet.marker([driverLat, driverLng], { icon: originIcon }).addTo(map);

			// Add destination marker
			leaflet.marker([destLat, destLng], { icon: destIcon })
				.addTo(map)
				.bindTooltip(destLabel, {
					permanent: true,
					direction: 'top',
					offset: [0, -22],
					className: 'map-tooltip'
				});

			// Place driver at progress point along the route
			let driverLatLng: [number, number] = [driverLat, driverLng];
			if (routePoints.length > 1) {
				const idx = Math.min(
					Math.floor(routePoints.length * driverProgress),
					routePoints.length - 1
				);
				driverLatLng = routePoints[idx];
			}

			driverMarker = leaflet.marker(driverLatLng, { icon: driverIcon, zIndexOffset: 1000 })
				.addTo(map)
				.bindTooltip(driverLabel, {
					permanent: true,
					direction: 'top',
					offset: [0, -26],
					className: 'map-tooltip'
				});

			// Fit bounds
			const bounds = leaflet.latLngBounds(
				[driverLat, driverLng],
				[destLat, destLng]
			);
			map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });

			// Animate driver smoothly along remaining route
			if (animateDriver && routePoints.length > 2) {
				const startIdx = Math.floor(routePoints.length * driverProgress);
				let currentIdx = startIdx;
				const endIdx = routePoints.length - 1;

				const interval = setInterval(() => {
					if (!driverMarker || currentIdx >= endIdx) {
						// Reset to start of progress section for loop
						currentIdx = startIdx;
					}
					currentIdx++;
					if (currentIdx < routePoints.length && driverMarker) {
						driverMarker.setLatLng(routePoints[currentIdx]);
					}
				}, 350);

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
