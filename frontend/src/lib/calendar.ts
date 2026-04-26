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
  lane: number;
  colorIndex: number;
};

const BAR_COLOR_COUNT = 4;

export const getMonthDays = (month: Date): CalendarDay[] => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

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
  const baseSegments = reservations
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
    .filter((segment): segment is { reservation: Reservation; startColumn: number; span: number } =>
      Boolean(segment),
    )
    .sort((left, right) => {
      if (left.startColumn !== right.startColumn) {
        return left.startColumn - right.startColumn;
      }
      if (left.span !== right.span) {
        return right.span - left.span;
      }
      return left.reservation.id.localeCompare(right.reservation.id);
    });

  const laneEndColumns: number[] = [];
  const laneColors: number[] = [];

  return baseSegments.map((segment) => {
    const segmentEndColumn = segment.startColumn + segment.span - 1;
    let lane = laneEndColumns.findIndex((endColumn) => endColumn < segment.startColumn);

    if (lane === -1) {
      lane = laneEndColumns.length;
      laneEndColumns.push(segmentEndColumn);
      laneColors.push(-1);
    } else {
      laneEndColumns[lane] = segmentEndColumn;
    }

    const usedColors = new Set<number>();
    laneEndColumns.forEach((endColumn, laneIndex) => {
      if (laneIndex === lane) {
        return;
      }
      const overlaps = endColumn >= segment.startColumn;
      if (overlaps) {
        usedColors.add(laneColors[laneIndex]);
      }
    });

    let colorIndex = 0;
    while (usedColors.has(colorIndex)) {
      colorIndex = (colorIndex + 1) % BAR_COLOR_COUNT;
    }
    laneColors[lane] = colorIndex;

    return {
      ...segment,
      lane,
      colorIndex,
    };
  });
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
