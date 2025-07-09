export interface Booking {
  id: string;
  pickupReturnStationId: string;
  customerName: string;
  startDate: string;
  endDate: string;
}

export type BookingType = "dropoff" | "pickup";

export interface TypedBooking extends Booking {
  type: BookingType;
}

export interface BookingState {
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
}
