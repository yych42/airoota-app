import type { Booking, Driver } from '../types/booking';
import { airports } from './airports';
import { vehicles } from './vehicles';

export const mockDriver: Driver = {
  id: 'd1',
  name: '陳建宏',
  photo: '',
  rating: 4.9,
  trips: 1247,
  vehicle: 'Toyota Camry',
  plateNumber: 'ABC-1234',
  vehicleColor: '黑色',
};

export const defaultActiveBooking: Booking = {
  id: 'b-active-demo',
  tripType: 'pickup',
  airport: airports[0],
  address: '台北市信義區信義路五段7號',
  date: '2026-03-13',
  time: '14:30',
  flightNumber: 'BR872',
  vehicle: vehicles[0],
  price: 1200,
  state: 'en-route',
  driver: mockDriver,
  paymentMethod: 'credit-card',
};

export const initialUpcomingBookings: Booking[] = [
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
    paymentMethod: 'credit-card',
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
    paymentMethod: 'apple-pay',
  },
];

export const initialPastBookings: Booking[] = [
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
    paymentMethod: 'credit-card',
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
    paymentMethod: 'credit-card',
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
    paymentMethod: 'credit-card',
  },
];

export const mockMessages = [
  { from: 'driver' as const, text: '您好，我已出發前往機場', time: '14:18' },
  { from: 'driver' as const, text: '預計 12 分鐘後到達', time: '14:19' },
];

export const driverPos: [number, number] = [25.0300, 121.4500];
export const destPos: [number, number] = [25.0330, 121.5654];
