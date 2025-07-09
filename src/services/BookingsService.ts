import ApiService from "@/services/ApiService";
import type { Booking } from "@/models";

export default class BookingsService {
  private static readonly ENDPOINTS = {
    BOOKING: (stationId: string, bookingId: string) =>
      `/stations/${stationId}/bookings/${bookingId}`,
  };

  public async getBookingsByStation(
    stationId: string,
    bookingId: string
  ): Promise<Booking | null> {
    try {
      return await ApiService.get<Booking>(
        BookingsService.ENDPOINTS.BOOKING(stationId, bookingId)
      );
    } catch (error) {
      console.error("Error while fetching bookings:", error);
      return null;
    }
  }

  public async updateBooking(booking: Booking): Promise<Booking | null> {
    // Mocked api, best case scenario :)
    return Promise.resolve(booking);
  }
}
