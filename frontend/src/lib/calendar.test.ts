import { describe, expect, it } from "vitest";

import { getReservationDates, getWeekSegments } from "./calendar";

describe("getReservationDates", () => {
  it("returns every day in the reservation range", () => {
    const days = getReservationDates({
      id: "1",
      owner_name: "Jamie",
      dog_name: "Pepper",
      price: 42,
      is_rover: false,
      start_date: "2026-04-10",
      end_date: "2026-04-13",
    });

    expect(days).toEqual([
      "2026-04-10",
      "2026-04-11",
      "2026-04-12",
      "2026-04-13",
    ]);
  });
});

describe("getWeekSegments", () => {
  it("assigns different lanes and colors to overlapping reservations", () => {
    const week = [
      new Date("2026-04-26"),
      new Date("2026-04-27"),
      new Date("2026-04-28"),
      new Date("2026-04-29"),
      new Date("2026-04-30"),
      new Date("2026-05-01"),
      new Date("2026-05-02"),
    ];

    const segments = getWeekSegments(week, [
      {
        id: "1",
        owner_name: "Irene",
        dog_name: "Milu",
        price: 10,
        is_rover: false,
        start_date: "2026-04-26",
        end_date: "2026-04-27",
      },
      {
        id: "2",
        owner_name: "Paloma",
        dog_name: "Robin",
        price: 10,
        is_rover: false,
        start_date: "2026-04-26",
        end_date: "2026-04-28",
      },
      {
        id: "3",
        owner_name: "Polina",
        dog_name: "Ferdinand",
        price: 10,
        is_rover: false,
        start_date: "2026-05-01",
        end_date: "2026-05-02",
      },
    ]);

    expect(segments).toHaveLength(3);
    expect(segments[0].lane).toBe(0);
    expect(segments[1].lane).toBe(1);
    expect(segments[0].colorIndex).not.toBe(segments[1].colorIndex);
    expect(segments[2].lane).toBe(0);
  });
});
