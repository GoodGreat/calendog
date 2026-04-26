import { type FormEvent, useState } from "react";

import type { Reservation, ReservationInput } from "../types/reservation";

type Props = {
  onClose: () => void;
  onSave: (input: ReservationInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialValue?: Reservation | null;
};

const initialState: ReservationInput = {
  owner_name: "",
  dog_name: "",
  price: 0,
  is_rover: false,
  start_date: "",
  end_date: "",
};

export function ReservationForm({ onClose, onSave, onDelete, initialValue = null }: Props) {
  const [form, setForm] = useState<ReservationInput>(
    initialValue
      ? {
          owner_name: initialValue.owner_name,
          dog_name: initialValue.dog_name,
          price: initialValue.price,
          is_rover: initialValue.is_rover,
          start_date: initialValue.start_date,
          end_date: initialValue.end_date,
        }
      : initialState,
  );
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditing = Boolean(initialValue);

  const update = <K extends keyof ReservationInput>(key: K, value: ReservationInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await onSave(form);
      if (!isEditing) {
        setForm(initialState);
      }
      onClose();
    } catch {
      setError("Could not save the reservation. Check the backend connection and try again.");
    }
  };

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }
    setError("");
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch {
      setError("Could not delete the reservation. Check the backend connection and try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-bark">
            {isEditing ? "Edit reservation" : "New reservation"}
          </h2>
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

        <div className="mt-5 flex gap-3">
          {isEditing ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-2xl border border-red-200 px-4 py-3 font-medium text-red-600 disabled:opacity-60"
            >
              Delete
            </button>
          ) : null}
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-orange-500 px-4 py-3 font-medium text-white"
          >
            {isEditing ? "Update reservation" : "Save reservation"}
          </button>
        </div>
      </form>
    </div>
  );
}
