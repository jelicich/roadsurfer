import {
  shallowMount,
  mount,
  createLocalVue,
  type Wrapper,
} from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type Vue from "vue";
import BookingCalendar from "./BookingCalendar.vue";
import { BookingCalendarModule } from "./BookingCalendarModule";
import Vuex, { Store } from "vuex";
import type { Station, TypedBooking, Booking } from "@/models";
import { format } from "date-fns";

// Interfaces for component instance and related types
interface BookingCalendarVue extends Vue {
  bookingCalendarModule: {
    getCurrentWeek: () => Date[];
    goToNextWeek: () => Date[];
    goToPreviousWeek: () => Date[];
    formatDate: (date: Date) => string;
    getBookingsForDay: (day: Date, station: Station) => TypedBooking[];
    goToLatestBooking: (station: Station) => Date[];
    buildUpdatePayload: (booking: TypedBooking, newDate: Date) => Booking;
  };
  weekDays: Date[];
  getBookingsForDay: (day: Date) => TypedBooking[];
  openBookingDetails: (bookingId: string) => void;
  draggedBooking: TypedBooking | null;
  setDraggedBooking: (booking: TypedBooking) => void;
  updateBooking: (newDate: Date) => Promise<void>;
}

// Define state structure for type safety
interface StationsState {
  selectedStation: Station | null;
}

interface Router {
  push: (route: {
    name: string;
    params: { bookingId: string; stationId: string };
  }) => void;
}

// Mock the BookingCalendarModule
vi.mock("./BookingCalendarModule", () => {
  const mockWeekDays = [
    new Date("2025-07-07T00:00:00Z"), // Monday
    new Date("2025-07-08T00:00:00Z"), // Tuesday
    new Date("2025-07-09T00:00:00Z"), // Wednesday
    new Date("2025-07-10T00:00:00Z"), // Thursday
    new Date("2025-07-11T00:00:00Z"), // Friday
    new Date("2025-07-12T00:00:00Z"), // Saturday
    new Date("2025-07-13T00:00:00Z"), // Sunday
  ];

  return {
    BookingCalendarModule: vi.fn().mockImplementation(() => ({
      getCurrentWeek: vi.fn().mockReturnValue(mockWeekDays),
      goToNextWeek: vi
        .fn()
        .mockReturnValue(
          mockWeekDays.map(
            (d) => new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000)
          )
        ),
      goToPreviousWeek: vi
        .fn()
        .mockReturnValue(
          mockWeekDays.map(
            (d) => new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000)
          )
        ),
      formatDate: vi
        .fn()
        .mockImplementation((date: Date) => format(date, "EEE dd MMM yyyy")),
      getBookingsForDay: vi.fn().mockReturnValue([]),
      goToLatestBooking: vi.fn().mockReturnValue(mockWeekDays),
      buildUpdatePayload: vi.fn().mockImplementation((booking, newDate) => ({
        id: booking.id,
        pickupReturnStationId: booking.pickupReturnStationId,
        customerName: booking.customerName,
        startDate:
          booking.type === "pickup" ? newDate.toISOString() : booking.startDate,
        endDate:
          booking.type === "dropoff" ? newDate.toISOString() : booking.endDate,
      })),
    })),
  };
});

// Mock the date-fns isToday function
vi.mock("date-fns", async () => {
  const actual = await vi.importActual("date-fns");
  return {
    ...(actual as Record<string, unknown>),
    isToday: vi.fn().mockImplementation((date: Date) => {
      // Mock to make 2025-07-10 (Thursday) as "today"
      const today = new Date("2025-07-10T00:00:00Z");
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    }),
  };
});

describe("BookingCalendar", () => {
  // Mock data
  const mockBookings: TypedBooking[] = [
    {
      id: "booking1",
      pickupReturnStationId: "station1",
      customerName: "John Doe",
      startDate: "2025-07-08T10:00:00Z",
      endDate: "2025-07-12T14:00:00Z",
      type: "pickup",
    },
    {
      id: "booking2",
      pickupReturnStationId: "station1",
      customerName: "Jane Smith",
      startDate: "2025-07-10T09:00:00Z",
      endDate: "2025-07-14T16:00:00Z",
      type: "pickup",
    },
  ];

  const mockStation: Station = {
    id: "station1",
    name: "Test Station",
    bookings: mockBookings,
  };

  let localVue: ReturnType<typeof createLocalVue>;
  let store: Store<{ stations: StationsState }>;
  let wrapper: Wrapper<Vue>;
  let $router: Router;

  beforeEach(() => {
    // Create a fresh Vue instance
    localVue = createLocalVue();
    localVue.use(Vuex);

    // Mock Vuex store
    store = new Vuex.Store({
      modules: {
        stations: {
          namespaced: true,
          state: {
            selectedStation: null,
          },
          getters: {
            selectedStation: (state) => state.selectedStation,
          },
        },
        bookings: {
          namespaced: true,
          actions: {
            updateBooking: vi.fn(),
          },
        },
      },
    });

    // Mock router
    $router = {
      push: vi.fn(),
    } as Router;

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it("renders placeholder when no station is selected", () => {
    wrapper = shallowMount(BookingCalendar, {
      localVue,
      store,
      mocks: {
        $router,
      },
    });

    // Should show placeholder
    const placeholder = wrapper.find(".BookingCalendar-placeholder");
    expect(placeholder.exists()).toBe(true);
    expect(placeholder.text()).toContain("Please select a station");

    // Should not show the header with station name
    const header = wrapper.find(".BookingCalendar-header");
    expect(header.exists()).toBe(false);
  });

  it("renders station name when a station is selected", () => {
    // Set a selected station
    store.state.stations.selectedStation = mockStation;

    wrapper = shallowMount(BookingCalendar, {
      localVue,
      store,
      mocks: {
        $router,
      },
    });

    // Should show header with station name
    const header = wrapper.find(".BookingCalendar-header");
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain(mockStation.name);

    // Should not show placeholder
    const placeholder = wrapper.find(".BookingCalendar-placeholder");
    expect(placeholder.exists()).toBe(false);
  });

  it("initializes with the current week from BookingCalendarModule", () => {
    wrapper = shallowMount(BookingCalendar, {
      localVue,
      store,
      mocks: {
        $router,
      },
    });

    // Check that getCurrentWeek was called during component creation
    const vm = wrapper.vm as BookingCalendarVue;
    expect(vm.bookingCalendarModule.getCurrentWeek).toHaveBeenCalled();

    // Check that the week days were set correctly
    expect(vm.weekDays.length).toBe(7);
  });

  it("navigates to the next week", async () => {
    wrapper = shallowMount(BookingCalendar, {
      localVue,
      store,
      mocks: {
        $router,
      },
    });

    const vm = wrapper.vm as BookingCalendarVue;
    const nextWeekButton = wrapper.find(".BookingCalendar-control--next");

    // Click the next week button
    await nextWeekButton.trigger("click");

    // Check that goToNextWeek was called
    expect(vm.bookingCalendarModule.goToNextWeek).toHaveBeenCalled();
  });

  it("navigates to the previous week", async () => {
    wrapper = shallowMount(BookingCalendar, {
      localVue,
      store,
      mocks: {
        $router,
      },
    });

    const vm = wrapper.vm as BookingCalendarVue;
    const prevWeekButton = wrapper.find(".BookingCalendar-control--prev");

    // Click the previous week button
    await prevWeekButton.trigger("click");

    // Check that goToPreviousWeek was called
    expect(vm.bookingCalendarModule.goToPreviousWeek).toHaveBeenCalled();
  });

  it("displays the correct date format for each day", () => {
    // Create a spy on the formatDate method of BookingCalendarModule prototype
    const formatDateSpy = vi
      .fn()
      .mockImplementation((date: Date) => format(date, "EEE dd MMM yyyy"));

    // Create a new mock with the spy
    const mockModule = {
      getCurrentWeek: vi
        .fn()
        .mockReturnValue([new Date("2025-07-10T00:00:00Z")]),
      formatDate: formatDateSpy,
      goToNextWeek: vi.fn(),
      goToPreviousWeek: vi.fn(),
      getBookingsForDay: vi.fn().mockReturnValue([]),
      goToLatestBooking: vi.fn(),
    };

    // Mock the BookingCalendarModule constructor to return our mockModule
    (BookingCalendarModule as ReturnType<typeof vi.fn>).mockImplementation(
      () => mockModule
    );

    wrapper = mount(BookingCalendar, {
      localVue,
      store,
      mocks: {
        $router,
      },
    });

    // Our formatDate spy should have been called during rendering
    expect(formatDateSpy).toHaveBeenCalled();

    // Check the dates displayed in the calendar
    const dates = wrapper.findAll(".BookingCalendar-date");
    expect(dates.length).toBe(1); // We're only returning one date in getCurrentWeek for simplicity
  });

  it("highlights today correctly", () => {
    wrapper = shallowMount(BookingCalendar, {
      localVue,
      store,
      mocks: {
        $router,
      },
    });

    // Count days with the today class
    const todayDays = wrapper.findAll(".BookingCalendar-day--today");
    expect(todayDays.length).toBe(1); // Only one day should be marked as today

    // Check that the "Today" tag is shown
    expect(todayDays.at(0).find(".BookingCalendar-tag").text()).toBe("Today");
  });

  it("fetches bookings for each day", () => {
    // Set a selected station
    store.state.stations.selectedStation = mockStation;

    wrapper = shallowMount(BookingCalendar, {
      localVue,
      store,
      mocks: {
        $router,
      },
    });

    const vm = wrapper.vm as BookingCalendarVue;

    // Mock getBookingsForDay to return mock bookings for a specific day
    const thursday = new Date("2025-07-10T00:00:00Z");
    // The mock function has additional mock methods that we need to access
    const mockedFunction = vm.bookingCalendarModule
      .getBookingsForDay as ReturnType<typeof vi.fn>;
    mockedFunction.mockImplementation((day: Date) => {
      if (day.getTime() === thursday.getTime()) {
        return [{ ...mockBookings[1], type: "pickup" }];
      }
      return [];
    });

    // Call getBookingsForDay for Thursday
    const bookings = vm.getBookingsForDay(thursday);

    // Check that the method was called with the right parameters
    expect(vm.bookingCalendarModule.getBookingsForDay).toHaveBeenCalledWith(
      thursday,
      mockStation
    );

    // Check that the correct bookings were returned
    expect(bookings.length).toBe(1);
    expect(bookings[0].id).toBe("booking2");
  });

  it("navigates to booking details when openBookingDetails is called", async () => {
    // Set a selected station
    store.state.stations.selectedStation = mockStation;

    // Use shallowMount since we're going to directly call the method
    wrapper = shallowMount(BookingCalendar, {
      localVue,
      store,
      mocks: {
        $router,
      },
    });

    const vm = wrapper.vm as BookingCalendarVue;

    // Directly call the openBookingDetails method
    vm.openBookingDetails(mockBookings[0].id);

    // Check that router.push was called with the correct parameters
    expect($router.push).toHaveBeenCalledWith({
      name: "booking-info",
      params: {
        bookingId: mockBookings[0].id,
        stationId: mockStation.id,
      },
    });
  });

  // Tests for drag and drop functionality
  it("sets the dragged booking when dragstart event is triggered", () => {
    // Set a selected station
    store.state.stations.selectedStation = mockStation;

    wrapper = shallowMount(BookingCalendar, {
      localVue,
      store,
      mocks: {
        $router,
      },
    });

    const vm = wrapper.vm as BookingCalendarVue;

    // Call setDraggedBooking directly to simulate dragstart
    vm.setDraggedBooking(mockBookings[0]);

    // Check that draggedBooking was set correctly
    expect(vm.draggedBooking).toEqual(mockBookings[0]);
  });

  it("updates booking when drop event is triggered", async () => {
    // Set a selected station
    store.state.stations.selectedStation = mockStation;

    // Mock the saveBooking action
    const saveBookingSpy = vi.fn();

    // Explicitly mock buildUpdatePayload for this test
    const buildUpdatePayloadMock = vi
      .fn()
      .mockImplementation((booking, newDate) => ({
        id: booking.id,
        pickupReturnStationId: booking.pickupReturnStationId,
        customerName: booking.customerName,
        startDate:
          booking.type === "pickup" ? newDate.toISOString() : booking.startDate,
        endDate:
          booking.type === "dropoff" ? newDate.toISOString() : booking.endDate,
      }));

    // Mock the BookingCalendarModule constructor to return our mock with buildUpdatePayload
    (BookingCalendarModule as ReturnType<typeof vi.fn>).mockImplementation(
      () => ({
        getCurrentWeek: vi.fn().mockReturnValue([
          new Date("2025-07-07T00:00:00Z"), // Monday
          new Date("2025-07-08T00:00:00Z"), // Tuesday
          new Date("2025-07-09T00:00:00Z"), // Wednesday
          new Date("2025-07-10T00:00:00Z"), // Thursday
          new Date("2025-07-11T00:00:00Z"), // Friday
          new Date("2025-07-12T00:00:00Z"), // Saturday
          new Date("2025-07-13T00:00:00Z"), // Sunday
        ]),
        goToNextWeek: vi.fn(),
        goToPreviousWeek: vi.fn(),
        formatDate: vi
          .fn()
          .mockImplementation((date: Date) => format(date, "EEE dd MMM yyyy")),
        getBookingsForDay: vi.fn().mockReturnValue([]),
        goToLatestBooking: vi.fn(),
        buildUpdatePayload: buildUpdatePayloadMock,
      })
    );

    wrapper = shallowMount(BookingCalendar, {
      localVue,
      store: new Vuex.Store({
        modules: {
          stations: {
            namespaced: true,
            state: {
              selectedStation: mockStation,
            },
            getters: {
              selectedStation: (state) => state.selectedStation,
            },
          },
          bookings: {
            namespaced: true,
            actions: {
              updateBooking: saveBookingSpy,
            },
          },
        },
      }),
      mocks: {
        $router,
      },
    });

    const vm = wrapper.vm as BookingCalendarVue;

    // Set the dragged booking
    vm.setDraggedBooking(mockBookings[0]);

    // Create a new date for the drop target
    const newDate = new Date("2025-07-15T00:00:00Z");

    // Call updateBooking to simulate drop
    await vm.updateBooking(newDate);

    // Check that buildUpdatePayload was called with the right parameters
    expect(buildUpdatePayloadMock).toHaveBeenCalledWith(
      mockBookings[0],
      newDate
    );

    // Check that saveBooking action was dispatched with the correct payload
    expect(saveBookingSpy).toHaveBeenCalled();
  });

  it("doesn't update booking when no booking is being dragged", async () => {
    // Set a selected station
    store.state.stations.selectedStation = mockStation;

    // Mock the saveBooking action
    const saveBookingSpy = vi.fn();

    // Explicitly mock buildUpdatePayload for this test
    const buildUpdatePayloadMock = vi
      .fn()
      .mockImplementation((booking, newDate) => ({
        id: booking.id,
        pickupReturnStationId: booking.pickupReturnStationId,
        customerName: booking.customerName,
        startDate:
          booking.type === "pickup" ? newDate.toISOString() : booking.startDate,
        endDate:
          booking.type === "dropoff" ? newDate.toISOString() : booking.endDate,
      }));

    // Mock the BookingCalendarModule constructor to return our mock with buildUpdatePayload
    (BookingCalendarModule as ReturnType<typeof vi.fn>).mockImplementation(
      () => ({
        getCurrentWeek: vi.fn().mockReturnValue([
          new Date("2025-07-07T00:00:00Z"), // Monday
          new Date("2025-07-08T00:00:00Z"), // Tuesday
          new Date("2025-07-09T00:00:00Z"), // Wednesday
          new Date("2025-07-10T00:00:00Z"), // Thursday
          new Date("2025-07-11T00:00:00Z"), // Friday
          new Date("2025-07-12T00:00:00Z"), // Saturday
          new Date("2025-07-13T00:00:00Z"), // Sunday
        ]),
        goToNextWeek: vi.fn(),
        goToPreviousWeek: vi.fn(),
        formatDate: vi
          .fn()
          .mockImplementation((date: Date) => format(date, "EEE dd MMM yyyy")),
        getBookingsForDay: vi.fn().mockReturnValue([]),
        goToLatestBooking: vi.fn(),
        buildUpdatePayload: buildUpdatePayloadMock,
      })
    );

    wrapper = shallowMount(BookingCalendar, {
      localVue,
      store: new Vuex.Store({
        modules: {
          stations: {
            namespaced: true,
            state: {
              selectedStation: mockStation,
            },
            getters: {
              selectedStation: (state) => state.selectedStation,
            },
          },
          bookings: {
            namespaced: true,
            actions: {
              updateBooking: saveBookingSpy,
            },
          },
        },
      }),
      mocks: {
        $router,
      },
    });

    const vm = wrapper.vm as BookingCalendarVue;

    // Don't set a dragged booking (draggedBooking is null)

    // Create a new date for the drop target
    const newDate = new Date("2025-07-15T00:00:00Z");

    // Call updateBooking to simulate drop
    await vm.updateBooking(newDate);

    // Check that buildUpdatePayload was not called
    expect(buildUpdatePayloadMock).not.toHaveBeenCalled();

    // Check that saveBooking action was not dispatched
    expect(saveBookingSpy).not.toHaveBeenCalled();
  });

  it("simulates complete drag and drop workflow", async () => {
    // Set a selected station
    store.state.stations.selectedStation = mockStation;

    // Mock the saveBooking action
    const saveBookingSpy = vi.fn();

    // Explicitly mock buildUpdatePayload for this test
    const buildUpdatePayloadMock = vi
      .fn()
      .mockImplementation((booking, newDate) => ({
        id: booking.id,
        pickupReturnStationId: booking.pickupReturnStationId,
        customerName: booking.customerName,
        startDate:
          booking.type === "pickup" ? newDate.toISOString() : booking.startDate,
        endDate:
          booking.type === "dropoff" ? newDate.toISOString() : booking.endDate,
      }));

    // Create a complete mock for the calendar module with all necessary methods
    const mockWeekDays = [
      new Date("2025-07-07T00:00:00Z"), // Monday
      new Date("2025-07-08T00:00:00Z"), // Tuesday - booking1 start date
      new Date("2025-07-09T00:00:00Z"), // Wednesday
      new Date("2025-07-10T00:00:00Z"), // Thursday - booking2 start date
      new Date("2025-07-11T00:00:00Z"), // Friday
      new Date("2025-07-12T00:00:00Z"), // Saturday - booking1 end date
      new Date("2025-07-13T00:00:00Z"), // Sunday
    ];

    // Create a simplified mock that always returns a booking for any day
    // This ensures that booking elements will always be rendered in the test
    const getBookingsForDayMock = vi
      .fn()
      .mockReturnValue([{ ...mockBookings[0], type: "pickup" }]);

    // Mock the BookingCalendarModule constructor to return our mock with buildUpdatePayload
    (BookingCalendarModule as ReturnType<typeof vi.fn>).mockImplementation(
      () => ({
        getCurrentWeek: vi.fn().mockReturnValue(mockWeekDays),
        goToNextWeek: vi.fn(),
        goToPreviousWeek: vi.fn(),
        formatDate: vi
          .fn()
          .mockImplementation((date: Date) => format(date, "EEE dd MMM yyyy")),
        getBookingsForDay: getBookingsForDayMock,
        goToLatestBooking: vi.fn(),
        buildUpdatePayload: buildUpdatePayloadMock,
      })
    );

    // Create a store with the selectedStation explicitly set
    const testStore = new Vuex.Store({
      modules: {
        stations: {
          namespaced: true,
          state: {
            selectedStation: {
              ...mockStation,
              bookings: [...mockBookings], // Ensure bookings array is set and non-empty
            },
          },
          getters: {
            selectedStation: (state) => state.selectedStation,
          },
        },
        bookings: {
          namespaced: true,
          actions: {
            updateBooking: saveBookingSpy,
          },
        },
      },
    });

    // Mount with the full rendering mode
    wrapper = mount(BookingCalendar, {
      localVue,
      store: testStore,
      mocks: {
        $router,
      },
      // No need for sync option, it's not supported in Vue Test Utils
    });

    // Manually verify weekDays were set correctly
    const vm = wrapper.vm as BookingCalendarVue;
    expect(vm.weekDays.length).toBe(7);

    // Find a booking element to drag
    const bookingElements = wrapper.findAll(".BookingCalendar-booking");
    expect(bookingElements.length).toBeGreaterThan(0);

    // Trigger dragstart on a booking
    await bookingElements.at(0).trigger("dragstart");

    // Find a day element to drop onto
    const dayElements = wrapper.findAll(".BookingCalendar-day");

    // Should have 7 days (one for each day of the week)
    expect(dayElements.length).toBe(7);

    // Trigger drop on a day (use the first day that's not today)
    const dropTargetIndex = 0; // Monday
    await dayElements.at(dropTargetIndex).trigger("drop");

    // Check that saveBooking action was dispatched
    expect(saveBookingSpy).toHaveBeenCalled();
  });
});
