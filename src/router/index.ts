import Vue from "vue";
import VueRouter from "vue-router";
import BookingDashboard from "../views/booking-dashboard/BookingDashboard.vue";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  base: import.meta.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: BookingDashboard,
    },
    {
      path: "/booking-info/:stationId/:bookingId",
      name: "booking-info",
      components: {
        default: BookingDashboard,
        modal: () => import("../views/booking-info/BookingInfo.vue"),
      },
    },
  ],
});

export default router;
