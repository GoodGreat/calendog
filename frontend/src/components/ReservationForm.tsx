import { type FormEvent, useState } from "react";

import type { ReservationInput } from "../types/reservation";

type Props = {
  onClose: () => void;
  onSave: (input: ReservationInput) => Promise<void>;
};

const initialState: ReservationInput = {
  owner_name: "",
  dog_name: "",
  price: 0,
  is_rover: false,
  start_date: "",
  end_date: "",
};

export function ReservationForm({ onClose, onSave }: Props) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  const update = <K extends keyof ReservationInput>(key: K, value: ReservationInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await onSave(form);
      setForm(initialState);
      onClose();
    } catch {
      setError("Could not save the reservation. Check the backend connection and try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-bark">New reservation</h2>
          <button type="button" onClick={onClose} className="text-sm text-bark/70">
            Close
          </button>
        </div>

        <div className="grid gap-3">
          <input
            required
            placeholder="Owner name"
            className="rounded-2xl border border-orange-100 px-4 py-3"
            value={form.owner_name}
            onChange={(event) => update("owner_name", event.target.value)}
          />
          <input
            required
            placeholder="Dog name"
            className="rounded-2xl border border-orange-100 px-4 py-3"
            value={form.dog_name}
            onChange={(event) => update("dog_name", event.target.value)}
          />
          <input
            required
            min="0"
            step="0.01"
            type="number"
            placeholder="Price"
            className="rounded-2xl border border-orange-100 px-4 py-3"
            value={form.price}
            onChange={(event) => update("price", Number(event.target.value))}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="date"
              className="rounded-2xl border border-orange-100 px-4 py-3"
              value={form.start_date}
              onChange={(event) => update("start_date", event.target.value)}
            />
            <input
              required
              type="date"
              className="rounded-2xl border border-orange-100 px-4 py-3"
              value={form.end_date}
              onChange={(event) => update("end_date", event.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 rounded-2xl border border-orange-100 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.is_rover}
              onChange={(event) => update("is_rover", event.target.checked)}
            />
            Booked via Rover
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          className="mt-5 w-full rounded-2xl bg-orange-500 px-4 py-3 font-medium text-white"
        >
          Save reservation
        </button>
      </form>
    </div>
  );
}
