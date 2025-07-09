import BookingsService from "@/services/BookingsService";
import StationsService from "@/services/StationsService";
import type { Booking, BookingState } from "@/models";
import type { Commit, Dispatch } from "vuex";

const bookingsService = new BookingsService();
const stationsService = new StationsService();

const state: BookingState = {
  selectedBooking: null,
  loading: false,
  error: null,
};

const mutations = {
  SET_SELECTED_BOOKING(state: BookingState, booking: Booking | null) {
    state.selectedBooking = booking;
  },
  SET_LOADING(state: BookingState, loading: boolean) {
    state.loading = loading;
  },
  SET_ERROR(state: BookingState, error: string | null) {
    state.error = error;
  },
};

const actions = {
  async fetchBookingByStation(
    { commit }: { commit: Commit },
    { stationId, bookingId }: { stationId: string; bookingId: string }
  ) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const booking = await bookingsService.getBookingsByStation(
        stationId,
        bookingId
      );
      if (!booking) {
        throw new Error(`Booking with ID ${bookingId} not found`);
      }

      const stations = await stationsService.getStations();
      const currentStation = stations.find((station) => {
        return station.id === booking.pickupReturnStationId;
      });

      commit("SET_SELECTED_BOOKING", {
        ...booking,
        pickupReturnStationName: currentStation?.name,
      });
    } catch (error) {
      commit(
        "SET_ERROR",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      commit("SET_SELECTED_BOOKING", null);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  clearSelectedBooking({ commit }: { commit: Commit }) {
    commit("SET_SELECTED_BOOKING", null);
  },

  async updateBooking(
    { commit, dispatch }: { commit: Commit; dispatch: Dispatch },
    booking: Booking
  ) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const updatedBooking = await bookingsService.updateBooking(booking);
      if (!updatedBooking) {
        throw new Error("Failed to update booking");
      }

      if (
        state.selectedBooking &&
        state.selectedBooking.id === updatedBooking.id
      ) {
        commit("SET_SELECTED_BOOKING", updatedBooking);
      }

      // Ideally bookings belong to their own domain, not stations
      dispatch("stations/updateBookingInSelectedStation", updatedBooking, {
        root: true,
      });

      return updatedBooking;
    } catch (error) {
      commit(
        "SET_ERROR",
        error instanceof Error
          ? error.message
          : "An error occurred while updating the booking"
      );
      return null;
    } finally {
      commit("SET_LOADING", false);
    }
  },
};

const getters = {
  selectedBooking: (state: BookingState) => state.selectedBooking,
  isLoading: (state: BookingState) => state.loading,
  hasError: (state: BookingState) => !!state.error,
  errorMessage: (state: BookingState) => state.error,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
