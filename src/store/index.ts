import Vue from "vue";
import Vuex from "vuex";
import stations from "./modules/stations";
import bookings from "./modules/bookings";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // Root state properties
  },
  mutations: {
    // Root mutations
  },
  actions: {
    // Root actions
  },
  getters: {
    // Root getters
  },
  modules: {
    stations,
    bookings,
  },
});
