import { create } from 'zustand';
import type { Booking, BookingState, Driver } from '../types/booking';
import {
  defaultActiveBooking,
  initialUpcomingBookings,
  initialPastBookings,
  mockDriver,
} from '../data/mock';

interface BookingStore {
  currentBooking: Booking | null;
  upcomingBookings: Booking[];
  pastBookings: Booking[];

  setBooking: (booking: Booking) => void;
  resetBooking: () => void;
  setDriver: (driver: Driver) => void;
  setState: (state: BookingState) => void;
  addUpcoming: (booking: Booking) => void;
  addPast: (booking: Booking) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  currentBooking: null,
  upcomingBookings: initialUpcomingBookings,
  pastBookings: initialPastBookings,

  setBooking: (booking) => set({ currentBooking: booking }),
  resetBooking: () => set({ currentBooking: null }),

  setDriver: (driver) =>
    set((state) => ({
      currentBooking: state.currentBooking
        ? { ...state.currentBooking, driver, state: 'assigned' }
        : null,
    })),

  setState: (bookingState) =>
    set((state) => ({
      currentBooking: state.currentBooking
        ? { ...state.currentBooking, state: bookingState }
        : null,
    })),

  addUpcoming: (booking) =>
    set((state) => ({
      upcomingBookings: [...state.upcomingBookings, booking],
    })),

  addPast: (booking) =>
    set((state) => ({
      pastBookings: [booking, ...state.pastBookings],
    })),
}));

// Re-export for convenience
export { defaultActiveBooking, mockDriver };
