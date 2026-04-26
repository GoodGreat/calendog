import os
from typing import Optional

from fastapi import FastAPI
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

    return app


app = create_app()
