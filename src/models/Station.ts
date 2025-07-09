import type { Booking } from "./Booking";

export interface Station {
  id: string;
  name: string;
  bookings: Booking[];
}

export interface StationState {
  stations: Station[];
  selectedStation: Station | null;
  loading: boolean;
  error: string | null;
}
