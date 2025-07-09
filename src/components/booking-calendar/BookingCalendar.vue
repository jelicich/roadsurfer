<template>
  <div class="BookingCalendar">
    <div class="BookingCalendar-header" v-if="selectedStation">
      <h2 class="BookingCalendar-title">
        Bookings for {{ selectedStation.name }}
      </h2>
    </div>
    <div class="BookingCalendar-placeholder" v-else>
      <p>Please select a station to view bookings</p>
    </div>

    <div class="BookingCalendar-controls">
      <button
        class="BookingCalendar-control BookingCalendar-control--prev"
        @click="showPreviousWeek"
      >
        Previous Week
      </button>
      <button
        class="BookingCalendar-control BookingCalendar-control--next"
        @click="showNextWeek"
      >
        Next Week
      </button>
    </div>

    <div class="BookingCalendar-grid">
      <div
        v-for="(day, index) in weekDays"
        :key="index"
        :class="{ 'BookingCalendar-day--today': isToday(day) }"
        @drop="updateBooking(day)"
        @dragover.prevent
        class="BookingCalendar-day"
      >
        <span v-if="isToday(day)" class="BookingCalendar-tag">Today</span>
        <h3 class="BookingCalendar-date">{{ formatDate(day) }}</h3>

        <div
          class="BookingCalendar-bookings"
          v-if="selectedStation && selectedStation.bookings"
        >
          <button
            v-for="(booking, i) in getBookingsForDay(day)"
            :key="`booking.id-${i}`"
            draggable="true"
            @dragstart="setDraggedBooking(booking)"
            :class="`BookingCalendar-booking BookingCalendar-booking--${booking.type}`"
            @click="openBookingDetails(booking.id)"
          >
            <span class="BookingCalendar-type">
              {{ booking.type }}
            </span>
            {{ booking.customerName }}
          </button>
        </div>
      </div>
    </div>
    <!-- Only for demonstration purposes -->
    <div v-if="selectedStation" class="BookingCalendar-temp">
      <button @click="goToLatestBooking" class="BookingCalendar-control">
        Go to latest booking
      </button>
      <span class="BookingCalendar-disclaimer">
        Only for demonstration purposes
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters } from "vuex";
import { BookingCalendarModule } from "@/components/booking-calendar/BookingCalendarModule";
import { isToday } from "date-fns";
import type { TypedBooking } from "@/models";

export default Vue.extend({
  name: "BookingCalendar",
  data() {
    return {
      bookingCalendarModule: new BookingCalendarModule(),
      weekDays: [] as Date[],
      draggedBooking: null as TypedBooking | null,
    };
  },
  computed: {
    ...mapGetters("stations", ["selectedStation"]),
  },
  created() {
    this.weekDays = this.bookingCalendarModule.getCurrentWeek();
  },
  methods: {
    ...mapActions("bookings", {
      saveBooking: "updateBooking",
    }),
    showNextWeek() {
      this.weekDays = this.bookingCalendarModule.goToNextWeek();
    },
    showPreviousWeek() {
      this.weekDays = this.bookingCalendarModule.goToPreviousWeek();
    },
    formatDate(date: Date): string {
      return this.bookingCalendarModule.formatDate(date);
    },
    isToday(day: Date) {
      return isToday(day);
    },
    getBookingsForDay(day: Date): TypedBooking[] {
      if (!this.selectedStation) {
        return [];
      }

      return this.bookingCalendarModule.getBookingsForDay(
        day,
        this.selectedStation
      );
    },
    openBookingDetails(bookingId: string) {
      if (!this.selectedStation) {
        return;
      }

      this.$router.push({
        name: "booking-info",
        params: { bookingId: bookingId, stationId: this.selectedStation.id },
      });
    },
    setDraggedBooking(booking: TypedBooking) {
      this.draggedBooking = booking;
    },

    async updateBooking(newDate: Date) {
      if (!this.draggedBooking) {
        return;
      }

      const payload = this.bookingCalendarModule.buildUpdatePayload(
        this.draggedBooking,
        newDate
      );

      await this.saveBooking(payload);
    },

    // This method is only for demonstration purposes
    // The api results are quite old
    goToLatestBooking() {
      if (this.selectedStation) {
        this.weekDays = this.bookingCalendarModule.goToLatestBooking(
          this.selectedStation
        );
      }
    },
  },
});
</script>
