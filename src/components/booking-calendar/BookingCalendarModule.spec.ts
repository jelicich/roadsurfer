import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BookingCalendarModule } from "./BookingCalendarModule";
import type { Booking, Station, TypedBooking } from "@/models";
import { addDays, subDays, format, parseISO } from "date-fns";

describe("BookingCalendarModule", () => {
  // Reference date for consistent testing
  const fixedDate = new Date("2025-07-10T12:00:00Z"); // Thursday, July 10, 2025

  // Mock data
  const mockBookings: Booking[] = [
    {
      id: "booking1",
      pickupReturnStationId: "station1",
      customerName: "John Doe",
      startDate: "2025-07-08T10:00:00Z", // Tuesday
      endDate: "2025-07-12T14:00:00Z", // Saturday
    },
    {
      id: "booking2",
      pickupReturnStationId: "station1",
      customerName: "Jane Smith",
      startDate: "2025-07-09T09:00:00Z", // Wednesday
      endDate: "2025-07-11T16:00:00Z", // Friday
    },
    {
      id: "booking3",
      pickupReturnStationId: "station1",
      customerName: "Bob Johnson",
      startDate: "2025-07-14T11:00:00Z", // Monday next week
      endDate: "2025-07-18T15:00:00Z", // Friday next week
    },
  ];

  const mockStation: Station = {
    id: "station1",
    name: "Test Station",
    bookings: mockBookings,
  };

  const emptyStation: Station = {
    id: "emptyStation",
    name: "Empty Station",
    bookings: [],
  };

  let calendarModule: BookingCalendarModule;

  beforeEach(() => {
    // Mock Date.now to return a fixed timestamp
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);

    calendarModule = new BookingCalendarModule();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with current date", () => {
    const currentWeek = calendarModule.getCurrentWeek();

    // A week should have 7 days
    expect(currentWeek.length).toBe(7);

    // The week should start on Monday and end on Sunday
    expect(format(currentWeek[0], "EEEE")).toBe("Monday");
    expect(format(currentWeek[6], "EEEE")).toBe("Sunday");

    // The week should include our fixed date
    const containsFixedDate = currentWeek.some(
      (day) => format(day, "yyyy-MM-dd") === format(fixedDate, "yyyy-MM-dd")
    );
    expect(containsFixedDate).toBe(true);
  });

  it("should navigate to next week", () => {
    const currentWeek = calendarModule.getCurrentWeek();
    const nextWeek = calendarModule.goToNextWeek();

    // Next week should be 7 days after the current week
    expect(nextWeek[0].getTime()).toBe(addDays(currentWeek[0], 7).getTime());
    expect(nextWeek[6].getTime()).toBe(addDays(currentWeek[6], 7).getTime());
  });

  it("should navigate to previous week", () => {
    const currentWeek = calendarModule.getCurrentWeek();
    const prevWeek = calendarModule.goToPreviousWeek();

    // Previous week should be 7 days before the current week
    expect(prevWeek[0].getTime()).toBe(subDays(currentWeek[0], 7).getTime());
    expect(prevWeek[6].getTime()).toBe(subDays(currentWeek[6], 7).getTime());
  });

  it("should format dates correctly", () => {
    const formattedDate = calendarModule.formatDate(fixedDate);
    // Should format as "Thu 10 Jul 2025"
    expect(formattedDate).toBe(format(fixedDate, "EEE dd MMM yyyy"));
  });

  it("should return empty array for undefined station", () => {
    const day = calendarModule.getCurrentWeek()[0];
    const bookings = calendarModule.getBookingsForDay(
      day,
      undefined as unknown as Station
    );

    expect(bookings).toEqual([]);
  });

  it("should return empty array for station with empty bookings", () => {
    const day = calendarModule.getCurrentWeek()[0];
    // Use a station with empty bookings array instead of undefined
    const bookings = calendarModule.getBookingsForDay(day, emptyStation);

    expect(bookings).toEqual([]);
  });

  it("should return empty array when station is null", () => {
    const day = calendarModule.getCurrentWeek()[0];
    // Test with null station (which will be checked with !station)
    const bookings = calendarModule.getBookingsForDay(
      day,
      null as unknown as Station
    );

    expect(bookings).toEqual([]);
  });

  it("should return empty array for day with no bookings", () => {
    // Sunday of the current week won't have any bookings in our mock data
    const sunday = calendarModule.getCurrentWeek()[6];
    const bookings = calendarModule.getBookingsForDay(sunday, mockStation);

    expect(bookings).toEqual([]);
  });

  it("should return pickup bookings for a day", () => {
    // Tuesday should have one pickup booking
    const tuesday = parseISO("2025-07-08T00:00:00Z");
    const bookings = calendarModule.getBookingsForDay(tuesday, mockStation);

    expect(bookings.length).toBe(1);
    expect(bookings[0].id).toBe("booking1");
    expect(bookings[0].type).toBe("pickup");
  });

  it("should return dropoff bookings for a day", () => {
    // Saturday should have one dropoff booking
    const saturday = parseISO("2025-07-12T00:00:00Z");
    const bookings = calendarModule.getBookingsForDay(saturday, mockStation);

    expect(bookings.length).toBe(1);
    expect(bookings[0].id).toBe("booking1");
    expect(bookings[0].type).toBe("dropoff");
  });

  it("should return both pickup and dropoff bookings for a day", () => {
    // Friday should have one pickup and one dropoff
    const friday = parseISO("2025-07-11T00:00:00Z");
    const bookings = calendarModule.getBookingsForDay(friday, mockStation);

    expect(bookings.length).toBe(1);
    expect(bookings[0].id).toBe("booking2");
    expect(bookings[0].type).toBe("dropoff");
  });

  describe("buildUpdatePayload", () => {
    it("should update startDate for pickup bookings", () => {
      // Create a typed booking with type 'pickup'
      const typedBooking: TypedBooking = {
        ...mockBookings[0],
        type: "pickup",
      };

      // New date to set
      const newDate = new Date("2025-07-15T10:00:00Z");

      // Call the method
      const result = calendarModule.buildUpdatePayload(typedBooking, newDate);

      // Verify the result
      expect(result).toEqual({
        id: typedBooking.id,
        pickupReturnStationId: typedBooking.pickupReturnStationId,
        customerName: typedBooking.customerName,
        startDate: newDate.toISOString(),
        endDate: typedBooking.endDate,
      });

      // Verify type property is removed
      expect(result).not.toHaveProperty("type");

      // Verify startDate is updated
      expect(result.startDate).toBe(newDate.toISOString());

      // Verify endDate remains unchanged
      expect(result.endDate).toBe(typedBooking.endDate);
    });

    it("should update endDate for dropoff bookings", () => {
      // Create a typed booking with type 'dropoff'
      const typedBooking: TypedBooking = {
        ...mockBookings[0],
        type: "dropoff",
      };

      // New date to set
      const newDate = new Date("2025-07-20T14:00:00Z");

      // Call the method
      const result = calendarModule.buildUpdatePayload(typedBooking, newDate);

      // Verify the result
      expect(result).toEqual({
        id: typedBooking.id,
        pickupReturnStationId: typedBooking.pickupReturnStationId,
        customerName: typedBooking.customerName,
        startDate: typedBooking.startDate,
        endDate: newDate.toISOString(),
      });

      // Verify type property is removed
      expect(result).not.toHaveProperty("type");

      // Verify endDate is updated
      expect(result.endDate).toBe(newDate.toISOString());

      // Verify startDate remains unchanged
      expect(result.startDate).toBe(typedBooking.startDate);
    });
  });
});
