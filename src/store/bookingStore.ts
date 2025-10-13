import { create } from 'zustand';

export interface BookingItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Booking {
  id: string;
  branchId: string;
  branchName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingDate: string;
  bookingTime: string;
  numberOfGuests: number;
  items: BookingItem[];
  createdAt: string;
  status: 'pending' | 'approved' | 'confirmed' | 'declined';
  paymentLink?: string;
}

interface BookingState {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => void;
  markAsRead: (bookingId: string) => void;
  approveBooking: (bookingId: string, paymentLink: string) => void;
  confirmBooking: (bookingId: string) => void;
  declineBooking: (bookingId: string) => void;
  getBookingsByBranch: (branchId?: string) => Booking[];
  getPendingBookings: (branchId?: string) => Booking[];
}

const STORAGE_KEY = 'mock_bookings';

const saveBookings = (bookings: Booking[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

const loadBookings = (): Booking[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const useBookingStore = create<BookingState>((set) => ({
  bookings: loadBookings(),

  addBooking: (bookingData) =>
    set((state) => {
      const newBooking: Booking = {
        ...bookingData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      const updated = [newBooking, ...state.bookings];
      saveBookings(updated);
      return { bookings: updated };
    }),

  markAsRead: (bookingId) =>
    set((state) => {
      const updated = state.bookings.map((b) =>
        b.id === bookingId && b.status === 'pending' ? { ...b, status: 'pending' as const } : b
      );
      saveBookings(updated);
      return { bookings: updated };
    }),

  approveBooking: (bookingId, paymentLink) =>
    set((state) => {
      const updated = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'approved' as const, paymentLink } : b
      );
      saveBookings(updated);
      return { bookings: updated };
    }),

  confirmBooking: (bookingId) =>
    set((state) => {
      const updated = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'confirmed' as const } : b
      );
      saveBookings(updated);
      return { bookings: updated };
    }),

  declineBooking: (bookingId) =>
    set((state) => {
      const updated = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'declined' as const } : b
      );
      saveBookings(updated);
      return { bookings: updated };
    }),

  getBookingsByBranch: (branchId) => {
    const { bookings } = useBookingStore.getState();
    if (!branchId) return bookings;
    return bookings.filter((b) => b.branchId === branchId);
  },

  getPendingBookings: (branchId) => {
    const { bookings } = useBookingStore.getState();
    const filtered = branchId 
      ? bookings.filter((b) => b.branchId === branchId && b.status === 'pending')
      : bookings.filter((b) => b.status === 'pending');
    return filtered;
  },
}));
