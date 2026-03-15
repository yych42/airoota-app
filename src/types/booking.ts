export type TripType = 'pickup' | 'dropoff';
export type VehicleType = 'standard' | 'premium' | 'suv' | 'van9';
export type BookingState = 'idle' | 'pending' | 'assigned' | 'en-route' | 'in-progress' | 'completed';

export interface Airport {
  code: string;
  name: string;
  nameZh: string;
  city: string;
}

export interface Vehicle {
  type: VehicleType;
  name: string;
  nameZh: string;
  description: string;
  maxPassengers: number;
  maxLuggage: number;
  basePrice: number;
}

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

export interface VehicleConstraint {
  maxPassengers: number;
  maxLargeLuggage: number;
  maxSmallLuggage: number;
  conditionalLuggage?: {
    minPassengers: number;
    maxLargeLuggage: number;
    maxSmallLuggage: number;
  };
}

export interface AirportGuideStep {
  title: string;
  desc: string;
}

export interface AirportArrivalNote {
  text: string;
}

export interface AirportGuideData {
  code: string;
  name: string;
  city: string;
  steps: AirportGuideStep[];
  arrivalNotes: AirportArrivalNote[];
  tips: string[];
}

export interface AirportCardData {
  code: string;
  name: string;
  city: string;
  terminals: number;
  gradient: string;
  accentColor: string;
  bgAccent: string;
}
