from pathlib import Path
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import Reservation, ReservationCreate
from .storage import ReservationStore


def create_app(data_file: Optional[Path] = None) -> FastAPI:
    app = FastAPI(title="CalenDog API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.state.store = ReservationStore(
        data_file or Path(__file__).resolve().parent.parent / "reservations.json"
    )

    @app.get("/reservations", response_model=list[Reservation])
    def get_reservations() -> list[Reservation]:
        return app.state.store.list()

    @app.post("/reservations", response_model=Reservation, status_code=201)
    def create_reservation(payload: ReservationCreate) -> Reservation:
        reservation = Reservation(**payload.model_dump())
        return app.state.store.create(reservation)

    return app


app = create_app()
