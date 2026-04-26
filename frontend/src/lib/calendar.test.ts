import { describe, expect, it } from "vitest";

import { getReservationDates } from "./calendar";

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
