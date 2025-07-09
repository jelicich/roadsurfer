import StationsService from "@/services/StationsService";
import type { StationState, Booking, Station } from "@/models";
import type { Commit } from "vuex";

const stationsService = new StationsService();

const state: StationState = {
  stations: [],
  selectedStation: null,
  loading: false,
  error: null,
};

const mutations = {
  SET_STATIONS(state: StationState, stations: Station[]) {
    state.stations = stations;
  },
  SET_LOADING(state: StationState, loading: boolean) {
    state.loading = loading;
  },
  SET_ERROR(state: StationState, error: string | null) {
    state.error = error;
  },
  SET_SELECTED_STATION(state: StationState, station: Station | null) {
    state.selectedStation = station;
  },
  // Ideally bookings belong to their own domain, not stations
  UPDATE_BOOKING_IN_SELECTED_STATION(state: StationState, booking: Booking) {
    if (state.selectedStation && state.selectedStation.bookings) {
      const index = state.selectedStation.bookings.findIndex(
        (currentBooking) => currentBooking.id === booking.id
      );

      if (index !== -1) {
        state.selectedStation.bookings.splice(index, 1, booking);
      }
    }
  },
};

const actions = {
  async fetchStations({ commit }: { commit: Commit }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const stations = await stationsService.getStations();
      commit("SET_STATIONS", stations);
    } catch (error) {
      commit(
        "SET_ERROR",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      commit("SET_STATIONS", []);
    } finally {
      commit("SET_LOADING", false);
    }
  },

  selectStation({ commit }: { commit: Commit }, station: Station | null) {
    commit("SET_SELECTED_STATION", station);
  },

  updateBookingInSelectedStation(
    { commit }: { commit: Commit },
    booking: Booking
  ) {
    commit("UPDATE_BOOKING_IN_SELECTED_STATION", booking);
  },
};

const getters = {
  allStations: (state: StationState) => state.stations,
  selectedStation: (state: StationState) => state.selectedStation,
  isLoading: (state: StationState) => state.loading,
  hasError: (state: StationState) => !!state.error,
  errorMessage: (state: StationState) => state.error,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
