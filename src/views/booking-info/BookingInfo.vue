<template>
  <div class="BookingInfo">
    <BookingDetails :station-id="stationId" :booking-id="bookingId" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import BookingDetails from "@/components/booking-details/BookingDetails.vue";

export default Vue.extend({
  name: "BookingInfo",

  components: {
    BookingDetails,
  },

  computed: {
    stationId(): string {
      return this.$route.params.stationId || "";
    },
    bookingId(): string {
      return this.$route.params.bookingId || "";
    },
  },
});
</script>
