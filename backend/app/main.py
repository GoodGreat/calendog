import os
from typing import Optional

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware

from .models import Reservation, ReservationCreate
from .storage import PostgresReservationStore, ReservationStore


def get_allowed_origins() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173")
    return [item.strip() for item in raw.split(",") if item.strip()]


def create_app(store: Optional[ReservationStore] = None) -> FastAPI:
    app = FastAPI(title="CalenDog API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_allowed_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.state.store = store or PostgresReservationStore.from_env()

    @app.get("/reservations", response_model=list[Reservation])
    def get_reservations() -> list[Reservation]:
        return app.state.store.list()

    @app.post("/reservations", response_model=Reservation, status_code=201)
    def create_reservation(payload: ReservationCreate) -> Reservation:
        reservation = Reservation(**payload.model_dump())
        return app.state.store.create(reservation)

    @app.put("/reservations/{reservation_id}", response_model=Reservation)
    def update_reservation(reservation_id: str, payload: ReservationCreate) -> Reservation:
        reservation = Reservation(id=reservation_id, **payload.model_dump())
        updated = app.state.store.update(reservation_id, reservation)
        if updated is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
        return updated

    @app.delete("/reservations/{reservation_id}", status_code=204)
    def delete_reservation(reservation_id: str) -> Response:
        deleted = app.state.store.delete(reservation_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return app


app = create_app()
