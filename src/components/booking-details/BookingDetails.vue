<template>
  <ModalWindow :show="isModalOpen" title="Booking Details" @close="closeModal">
    <div class="BookingDetails">
      <div v-if="isLoading" class="BookingDetails-statusMessage is-loading">
        Loading booking details...
      </div>
      <div v-else-if="hasError" class="BookingDetails-statusMessage is-error">
        {{ hasError }}
      </div>
      <dl v-else-if="booking" class="BookingDetails-content">
        <div class="BookingDetails-group">
          <dt class="BookingDetails-term">Booking ID:</dt>
          <dd class="BookingDetails-description">{{ booking.id }}</dd>
        </div>
        <div class="BookingDetails-group">
          <dt class="BookingDetails-term">Customer:</dt>
          <dd class="BookingDetails-description">{{ booking.customerName }}</dd>
        </div>
        <div class="BookingDetails-group">
          <dt class="BookingDetails-term">Station ID:</dt>
          <dd class="BookingDetails-description">
            {{ booking.pickupReturnStationId }}
          </dd>
        </div>
        <div class="BookingDetails-group">
          <dt class="BookingDetails-term">Station name:</dt>
          <dd class="BookingDetails-description">
            {{ booking.pickupReturnStationName }}
          </dd>
        </div>
        <div class="BookingDetails-group">
          <dt class="BookingDetails-term">Start date:</dt>
          <dd class="BookingDetails-description">
            {{ formatDate(booking.startDate) }}
          </dd>
        </div>
        <div class="BookingDetails-group">
          <dt class="BookingDetails-term">End date:</dt>
          <dd class="BookingDetails-description">
            {{ formatDate(booking.endDate) }}
          </dd>
        </div>
      </dl>
      <div v-else class="BookingDetails-statusMessage is-empty">
        No booking information available.
      </div>
    </div>
  </ModalWindow>
</template>

<script lang="ts">
import Vue from "vue";
import ModalWindow from "@/components/modal-window/ModalWindow.vue";
import { format } from "date-fns";
import { mapActions, mapGetters } from "vuex";

export default Vue.extend({
  name: "BookingDetails",
  components: {
    ModalWindow,
  },
  props: {
    stationId: {
      type: String,
      required: true,
    },
    bookingId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isModalOpen: false,
    };
  },
  computed: {
    ...mapGetters("bookings", {
      booking: "selectedBooking",
      isLoading: "isLoading",
      hasError: "hasError",
    }),
  },
  mounted() {
    this.isModalOpen = true;
    this.fetchBookingDetails();
  },

  methods: {
    ...mapActions("bookings", [
      "fetchBookingByStation",
      "clearSelectedBooking",
    ]),

    fetchBookingDetails() {
      if (!this.bookingId || !this.stationId) {
        return;
      }

      this.fetchBookingByStation({
        stationId: this.stationId,
        bookingId: this.bookingId,
      });
    },
    formatDate(dateString: string): string {
      try {
        return format(new Date(dateString), "PPP");
      } catch (e) {
        return dateString;
      }
    },
    closeModal() {
      this.clearSelectedBooking();
      this.$router.push({ path: "/" });
    },
  },
});
</script>
