import { format, isToday } from "date-fns";

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
  onSelectReservation: (reservation: Reservation) => void;
};

const barColors = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-rose-500",
];

export const getDisplayedReservationPrice = (reservation: Reservation): string => {
  const effectivePrice = reservation.is_rover ? reservation.price * 0.85 : reservation.price;
  const roundedPrice = Math.round(effectivePrice * 100) / 100;
  return Number.isInteger(roundedPrice) ? `${roundedPrice}` : roundedPrice.toFixed(2);
};

export function Calendar({ month, reservations, onSelectReservation }: Props) {
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
          const laneCount = Math.max(segments.reduce((maxLane, segment) => Math.max(maxLane, segment.lane), -1) + 1, 1);
          const barAreaHeight = laneCount * 32;

          return (
            <div key={index} className="relative">
              <div className="grid grid-cols-7 gap-2">
                {week.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="rounded-3xl border border-orange-100 bg-cream p-2"
                    style={{ minHeight: `${barAreaHeight + 56}px` }}
                  >
                    <div
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm",
                        isToday(day) ? "bg-orange-500 text-white" : "text-bark",
                      ].join(" ")}
                    >
                      <span className={format(day, "M") !== format(month, "M") ? "opacity-35" : ""}>
                        {format(day, "d")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute inset-x-0 top-11 px-1">
                {segments.map((segment) => (
                  <button
                    type="button"
                    key={`${segment.reservation.id}-${segment.startColumn}`}
                    className={[
                      "absolute flex h-7 items-center overflow-hidden rounded-full px-3 text-xs font-medium text-white shadow-sm transition-transform hover:scale-[1.01]",
                      barColors[segment.colorIndex],
                    ].join(" ")}
                    style={{
                      top: `${segment.lane * 32}px`,
                      marginLeft: `calc((100% / 7) * ${segment.startColumn - 1} + 4px)`,
                      width: `calc((100% / 7) * ${segment.span} - 8px)`,
                    }}
                    onClick={() => onSelectReservation(segment.reservation)}
                  >
                    {segment.reservation.owner_name} - {segment.reservation.dog_name} (
                    {getDisplayedReservationPrice(segment.reservation)}€)
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
