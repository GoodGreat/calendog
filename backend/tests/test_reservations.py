import os
from typing import Optional

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

    def update(self, reservation_id: str, reservation: Reservation) -> Optional[Reservation]:
        for index, current in enumerate(self.reservations):
            if current.id == reservation_id:
                self.reservations[index] = reservation
                return reservation
        return None

    def delete(self, reservation_id: str) -> bool:
        before = len(self.reservations)
        self.reservations = [item for item in self.reservations if item.id != reservation_id]
        return len(self.reservations) < before


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


def test_update_reservation_persists_to_store():
    existing = Reservation(
        owner_name="Alex",
        dog_name="Milo",
        price=75.5,
        is_rover=True,
        start_date="2026-04-10",
        end_date="2026-04-12",
    )
    store = InMemoryReservationStore()
    store.reservations.append(existing)
    client = TestClient(create_app(store=store))

    response = client.put(
        f"/reservations/{existing.id}",
        json={
            "owner_name": "Alexandra",
            "dog_name": "Milo",
            "price": 90,
            "is_rover": False,
            "start_date": "2026-04-11",
            "end_date": "2026-04-13",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["owner_name"] == "Alexandra"
    assert body["id"] == existing.id
    assert store.reservations[0].price == 90


def test_delete_reservation_removes_from_store():
    existing = Reservation(
        owner_name="Alex",
        dog_name="Milo",
        price=75.5,
        is_rover=True,
        start_date="2026-04-10",
        end_date="2026-04-12",
    )
    store = InMemoryReservationStore()
    store.reservations.append(existing)
    client = TestClient(create_app(store=store))

    response = client.delete(f"/reservations/{existing.id}")

    assert response.status_code == 204
    assert store.reservations == []
