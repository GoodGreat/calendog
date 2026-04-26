import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import type { Reservation } from "../types/reservation";

export type CalendarDay = {
  date: Date;
  inMonth: boolean;
};

export type ReservationSegment = {
  reservation: Reservation;
  startColumn: number;
  span: number;
};

export const getMonthDays = (month: Date): CalendarDay[] => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => ({
    date,
    inMonth: isSameMonth(date, monthStart),
  }));
};

export const getReservationDates = (reservation: Reservation): string[] =>
  eachDayOfInterval({
    start: parseISO(reservation.start_date),
    end: parseISO(reservation.end_date),
  }).map((day) => format(day, "yyyy-MM-dd"));

export const getWeekSegments = (
  week: Date[],
  reservations: Reservation[],
): ReservationSegment[] => {
  const weekStart = week[0];
  const weekEnd = week[6];

  return reservations
    .map((reservation) => {
      const reservationStart = parseISO(reservation.start_date);
      const reservationEnd = parseISO(reservation.end_date);
      const startsInside = reservationStart > weekStart ? reservationStart : weekStart;
      const endsInside = reservationEnd < weekEnd ? reservationEnd : weekEnd;

      if (startsInside > endsInside) {
        return null;
      }

      const startColumn = week.findIndex(
        (day) => format(day, "yyyy-MM-dd") === format(startsInside, "yyyy-MM-dd"),
      );
      const span =
        eachDayOfInterval({ start: startsInside, end: endsInside }).length;

      return {
        reservation,
        startColumn: startColumn + 1,
        span,
      };
    })
    .filter((segment): segment is ReservationSegment => Boolean(segment));
};

export const getWeekChunks = (days: CalendarDay[]): Date[][] => {
  const chunks: Date[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    chunks.push(days.slice(index, index + 7).map((item) => item.date));
  }
  return chunks;
};

export const nextMonth = (month: Date) => addDays(endOfMonth(month), 1);
export const previousMonth = (month: Date) => addDays(startOfMonth(month), -1);
