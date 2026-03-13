import { writable } from 'svelte/store';

export type TripType = 'pickup' | 'dropoff';
export type VehicleType = 'standard' | 'premium' | 'suv' | 'van9';
export type BookingState = 'idle' | 'pending' | 'assigned' | 'en-route' | 'in-progress' | 'completed';

export interface Airport {
	code: string;
	name: string;
	nameZh: string;
	city: string;
}

export const airports: Airport[] = [
	{ code: 'TPE', name: 'Taoyuan International', nameZh: '桃園國際機場', city: '桃園' },
	{ code: 'TSA', name: 'Songshan Airport', nameZh: '松山機場', city: '台北' },
	{ code: 'KHH', name: 'Kaohsiung International', nameZh: '高雄國際機場', city: '高雄' },
	{ code: 'RMQ', name: 'Taichung Airport', nameZh: '台中機場', city: '台中' }
];

export interface Vehicle {
	type: VehicleType;
	name: string;
	nameZh: string;
	description: string;
	maxPassengers: number;
	maxLuggage: number;
	basePrice: number;
}

export const vehicles: Vehicle[] = [
	{
		type: 'standard',
		name: 'Standard Sedan',
		nameZh: '標準轎車',
		description: '舒適四門轎車，適合 1-3 位旅客',
		maxPassengers: 3,
		maxLuggage: 2,
		basePrice: 1200
	},
	{
		type: 'premium',
		name: 'Premium Sedan',
		nameZh: '豪華轎車',
		description: '高級轎車，寬敞舒適的乘車體驗',
		maxPassengers: 3,
		maxLuggage: 3,
		basePrice: 1800
	},
	{
		type: 'suv',
		name: 'SUV / Van',
		nameZh: '休旅車',
		description: '寬敞空間，適合家庭或多件行李',
		maxPassengers: 6,
		maxLuggage: 5,
		basePrice: 2400
	},
	{
		type: 'van9',
		name: '9-Seater Van',
		nameZh: '九人座',
		description: '寬敞九人座，適合大型團體或大量行李',
		maxPassengers: 8,
		maxLuggage: 8,
		basePrice: 3200
	}
];

export interface Driver {
	id: string;
	name: string;
	photo: string;
	rating: number;
	trips: number;
	vehicle: string;
	plateNumber: string;
	vehicleColor: string;
}

export const mockDriver: Driver = {
	id: 'd1',
	name: '陳建宏',
	photo: '',
	rating: 4.9,
	trips: 1247,
	vehicle: 'Toyota Camry',
	plateNumber: 'ABC-1234',
	vehicleColor: '黑色'
};

export interface Booking {
	id: string;
	tripType: TripType;
	airport: Airport;
	address: string;
	date: string;
	time: string;
	flightNumber: string;
	vehicle: Vehicle;
	price: number;
	state: BookingState;
	driver: Driver | null;
	paymentMethod: string;
}

function createBookingStore() {
	const { subscribe, set, update } = writable<Booking | null>(null);

	return {
		subscribe,
		set,
		update,
		reset: () => set(null),
		setDriver: (driver: Driver) =>
			update((b) => (b ? { ...b, driver, state: 'assigned' } : b)),
		setState: (state: BookingState) =>
			update((b) => (b ? { ...b, state } : b))
	};
}

export const currentBooking = createBookingStore();

// Demo upcoming bookings
export const upcomingBookings = writable<Booking[]>([
	{
		id: 'b-upcoming-1',
		tripType: 'pickup',
		airport: airports[0],
		address: '台北市大安區敦化南路二段201號',
		date: '2026-03-18',
		time: '15:20',
		flightNumber: 'BR872',
		vehicle: vehicles[0],
		price: 1200,
		state: 'assigned',
		driver: mockDriver,
		paymentMethod: 'credit-card'
	},
	{
		id: 'b-upcoming-2',
		tripType: 'dropoff',
		airport: airports[1],
		address: '台北市中山區南京東路三段50號',
		date: '2026-03-22',
		time: '06:30',
		flightNumber: 'CI202',
		vehicle: vehicles[1],
		price: 800,
		state: 'pending',
		driver: null,
		paymentMethod: 'apple-pay'
	}
]);

// Demo bookings for "My Trips"
export const pastBookings = writable<Booking[]>([
	{
		id: 'b-past-1',
		tripType: 'pickup',
		airport: airports[0],
		address: '台北市信義區信義路五段7號',
		date: '2026-02-28',
		time: '14:30',
		flightNumber: 'BR872',
		vehicle: vehicles[0],
		price: 1200,
		state: 'completed',
		driver: mockDriver,
		paymentMethod: 'credit-card'
	},
	{
		id: 'b-past-2',
		tripType: 'dropoff',
		airport: airports[1],
		address: '台北市大安區忠孝東路四段100號',
		date: '2026-02-15',
		time: '08:00',
		flightNumber: 'CI202',
		vehicle: vehicles[1],
		price: 800,
		state: 'completed',
		driver: mockDriver,
		paymentMethod: 'credit-card'
	},
	{
		id: 'b-past-3',
		tripType: 'pickup',
		airport: airports[0],
		address: '新北市板橋區文化路一段266號',
		date: '2026-01-20',
		time: '17:45',
		flightNumber: 'JL802',
		vehicle: vehicles[2],
		price: 2400,
		state: 'completed',
		driver: mockDriver,
		paymentMethod: 'credit-card'
	}
]);
