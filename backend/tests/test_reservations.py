import os

from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "postgresql://example")

from backend.app.main import create_app
from backend.app.models import Reservation


class InMemoryReservationStore:
    def __init__(self) -> None:
        self.reservations: list[Reservation] = []

    def list(self) -> list[Reservation]:
        return list(self.reservations)

    def create(self, reservation: Reservation) -> Reservation:
        self.reservations.append(reservation)
        return reservation


def test_create_reservation_persists_to_store():
    store = InMemoryReservationStore()
    client = TestClient(create_app(store=store))

    response = client.post(
        "/reservations",
        json={
            "owner_name": "Alex",
            "dog_name": "Milo",
            "price": 75.5,
            "is_rover": True,
            "start_date": "2026-04-10",
            "end_date": "2026-04-12",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["dog_name"] == "Milo"
    assert body["id"]
    assert store.reservations[0].owner_name == "Alex"
