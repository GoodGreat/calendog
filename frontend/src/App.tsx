import { Dog, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

import { Calendar } from "./components/Calendar";
import { ReservationForm } from "./components/ReservationForm";
import { nextMonth, previousMonth } from "./lib/calendar";
import type { Reservation, ReservationInput } from "./types/reservation";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export default function App() {
  const [month, setMonth] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sortReservations = (items: Reservation[]) =>
    [...items].sort((left, right) => {
      if (left.start_date !== right.start_date) {
        return left.start_date.localeCompare(right.start_date);
      }
      return left.end_date.localeCompare(right.end_date);
    });

  useEffect(() => {
    fetch(`${API_URL}/reservations`)
      .then((response) => response.json())
      .then((data: Reservation[]) => setReservations(sortReservations(data)))
      .catch(() => setReservations([]));
  }, []);

  const openCreateForm = () => {
    setActiveReservation(null);
    setShowForm(true);
  };

  const openEditForm = (reservation: Reservation) => {
    setActiveReservation(reservation);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setActiveReservation(null);
  };

  const handleCreate = async (input: ReservationInput) => {
    const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error("Failed to create reservation");
    }
    const created = (await response.json()) as Reservation;
    setReservations((current) => sortReservations([...current, created]));
  };

  const handleUpdate = async (input: ReservationInput) => {
    if (!activeReservation) {
      return;
    }
    const response = await fetch(`${API_URL}/reservations/${activeReservation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error("Failed to update reservation");
    }
    const updated = (await response.json()) as Reservation;
    setReservations((current) =>
      sortReservations(current.map((item) => (item.id === updated.id ? updated : item))),
    );
  };

  const handleDelete = async () => {
    if (!activeReservation) {
      return;
    }
    const response = await fetch(`${API_URL}/reservations/${activeReservation.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete reservation");
    }
    setReservations((current) => current.filter((item) => item.id !== activeReservation.id));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff1db,_#fff8ee_45%,_#dff2ff)] px-4 py-8 text-bark">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-white/80 p-6 shadow-xl shadow-orange-100/70 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-2xl bg-orange-500 p-3 text-white">
                <Dog size={26} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-bark/50">CalenDog</p>
                <h1 className="text-3xl font-semibold">Dog Sitting Calendar</h1>
              </div>
            </div>
            <p className="text-sm text-bark/70">
              Track Rover and private stays in one playful monthly view.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-medium text-white"
          >
            <Plus size={18} />
            Add reservation
          </button>
        </section>

        <section className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold">{format(month, "MMMM yyyy")}</h2>
            <p className="text-sm text-bark/60">{reservations.length} reservations loaded</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMonth((current) => previousMonth(current))}
              className="rounded-2xl border border-orange-200 bg-white p-3"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setMonth((current) => nextMonth(current))}
              className="rounded-2xl border border-orange-200 bg-white p-3"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        <Calendar
          month={month}
          reservations={reservations}
          onSelectReservation={openEditForm}
        />
      </div>

      {showForm ? (
        <ReservationForm
          initialValue={activeReservation}
          onClose={closeForm}
          onDelete={activeReservation ? handleDelete : undefined}
          onSave={activeReservation ? handleUpdate : handleCreate}
        />
      ) : null}
    </main>
  );
}
