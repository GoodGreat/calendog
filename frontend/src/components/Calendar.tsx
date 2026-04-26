import { format, isSameDay, isToday, parseISO } from "date-fns";

import {
  getMonthDays,
  getWeekChunks,
  getWeekSegments,
} from "../lib/calendar";
import type { Reservation } from "../types/reservation";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  month: Date;
  reservations: Reservation[];
};

export function Calendar({ month, reservations }: Props) {
  const days = getMonthDays(month);
  const weeks = getWeekChunks(days);

  return (
    <div className="rounded-[2rem] border border-orange-100 bg-white p-4 shadow-lg shadow-orange-100/60">
      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-bark/60">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="space-y-2">
        {weeks.map((week, index) => {
          const segments = getWeekSegments(week, reservations);

          return (
            <div key={index} className="relative">
              <div className="grid grid-cols-7 gap-2">
                {week.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="min-h-28 rounded-3xl border border-orange-100 bg-cream p-2"
                  >
                    <div
                      className={[
                        "mb-10 flex h-8 w-8 items-center justify-center rounded-full text-sm",
                        isToday(day) ? "bg-orange-500 text-white" : "text-bark",
                      ].join(" ")}
                    >
                      <span className={format(day, "M") !== format(month, "M") ? "opacity-35" : ""}>
                        {format(day, "d")}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-bark/70">
                      {reservations
                        .filter(
                          (reservation) =>
                            isSameDay(parseISO(reservation.start_date), day) ||
                            isSameDay(parseISO(reservation.end_date), day),
                        )
                        .slice(0, 2)
                        .map((reservation) => (
                          <div key={reservation.id} className="truncate">
                            {reservation.dog_name}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-11 space-y-1 px-1">
                {segments.map((segment) => (
                  <div
                    key={`${segment.reservation.id}-${segment.startColumn}`}
                    className={[
                      "flex h-7 items-center overflow-hidden rounded-full px-3 text-xs font-medium text-white shadow-sm",
                      segment.reservation.is_rover ? "bg-orange-500" : "bg-blue-500",
                    ].join(" ")}
                    style={{
                      marginLeft: `calc((100% / 7) * ${segment.startColumn - 1} + 4px)`,
                      width: `calc((100% / 7) * ${segment.span} - 8px)`,
                    }}
                  >
                    {segment.reservation.dog_name} · {segment.reservation.owner_name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
