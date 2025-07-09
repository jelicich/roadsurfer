import type { Station, TypedBooking, Booking } from "@/models";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  format,
  parseISO,
  isSameDay,
} from "date-fns";

export class BookingCalendarModule {
  private currentDate: Date;

  constructor() {
    this.currentDate = new Date();
  }

  public getCurrentWeek(): Date[] {
    const start = startOfWeek(this.currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(this.currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }

  public goToNextWeek(): Date[] {
    this.currentDate = addWeeks(this.currentDate, 1);
    return this.getCurrentWeek();
  }

  public goToPreviousWeek(): Date[] {
    this.currentDate = subWeeks(this.currentDate, 1);
    return this.getCurrentWeek();
  }

  public formatDate(date: Date): string {
    return format(date, "EEE dd MMM yyyy");
  }

  public getBookingsForDay(day: Date, station: Station): TypedBooking[] {
    if (!station || !station.bookings) {
      return [];
    }

    return station.bookings.reduce((acc: TypedBooking[], booking) => {
      const start = parseISO(booking.startDate);
      const end = parseISO(booking.endDate);

      if (isSameDay(day, start)) {
        acc.push({ ...booking, type: "pickup" });
      }

      if (isSameDay(day, end)) {
        acc.push({ ...booking, type: "dropoff" });
      }

      return acc;
    }, []);
  }

  buildUpdatePayload(booking: TypedBooking, newDate: Date): Booking {
    const typeMap = {
      pickup: "startDate",
      dropoff: "endDate",
    };

    const type = booking.type;
    const prop = typeMap[type];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type: _, ...rest } = booking;

    return {
      ...rest,
      [prop]: newDate.toISOString(),
    } as Booking;
  }

  // This method is only for demonstration purposes
  // Due to the api returning old results
  public goToLatestBooking(station: Station) {
    if (!station || !station.bookings || station.bookings.length === 0) {
      return this.getCurrentWeek();
    }
    const today = new Date();
    const dates: Array<Date> = [];
    station.bookings.forEach((booking) => {
      dates.push(parseISO(booking.startDate));
      dates.push(parseISO(booking.endDate));
    });
    let closestDate = dates[0];
    let closestDiff = Math.abs(today.getTime() - closestDate.getTime());
    for (let i = 1; i < dates.length; i++) {
      const date = dates[i];
      const diff = Math.abs(today.getTime() - date.getTime());
      if (diff < closestDiff) {
        closestDate = date;
        closestDiff = diff;
      }
    }
    this.currentDate = closestDate;
    return this.getCurrentWeek();
  }
}
