<template>
  <main class="BookingDashboard">
    <h1 class="BookingDashboard-title">Bookings Dashboard</h1>
    <StationsSearch />
    <BookingCalendar />
  </main>
</template>

<script lang="ts">
import Vue from "vue";
import StationsSearch from "@/components/stations-search/StationsSearch.vue";
import BookingCalendar from "@/components/booking-calendar/BookingCalendar.vue";

export default Vue.extend({
  name: "BookingDashboard",

  components: {
    StationsSearch,
    BookingCalendar,
  },
});
</script>
