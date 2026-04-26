import os
from datetime import datetime, timezone

from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "postgresql://example")

from backend.app.main import create_app
from backend.app.models import Reservation
from backend.app.reminders import (
    build_reminder_email,
    get_target_reminder_date,
    send_tomorrow_reminders,
)


class InMemoryReservationStore:
    def __init__(self) -> None:
        self.reservations: list[Reservation] = []

    def list(self) -> list[Reservation]:
        return list(self.reservations)

    def create(self, reservation: Reservation) -> Reservation:
        self.reservations.append(reservation)
        return reservation

    def update(self, reservation_id: str, reservation: Reservation):
        return reservation

    def delete(self, reservation_id: str) -> bool:
        return True


def test_get_target_reminder_date_uses_local_timezone():
    target = get_target_reminder_date(
        "Europe/Madrid",
        now=datetime(2026, 4, 27, 6, 0, tzinfo=timezone.utc),
    )

    assert target.isoformat() == "2026-04-28"


def test_send_tomorrow_reminders_only_sends_matching_start_dates(monkeypatch):
    monkeypatch.setenv("RESEND_API_KEY", "re_test")
    monkeypatch.setenv("REMINDER_FROM_EMAIL", "CalenDog <reminders@example.com>")
    monkeypatch.setenv("REMINDER_RECIPIENTS", "one@example.com,two@example.com")
    monkeypatch.setenv("REMINDER_TIMEZONE", "Europe/Madrid")

    captured_payload = {}

    def fake_send(config, payload):
        captured_payload["to"] = payload["to"]
        captured_payload["subject"] = payload["subject"]
        captured_payload["html"] = payload["html"]
        return {"id": "email_123"}

    monkeypatch.setattr("backend.app.reminders.send_resend_email", fake_send)

    store = InMemoryReservationStore()
    store.reservations = [
        Reservation(
            owner_name="Alex",
            dog_name="Milo",
            price=100,
            is_rover=True,
            start_date="2026-04-28",
            end_date="2026-04-29",
        ),
        Reservation(
            owner_name="Paloma",
            dog_name="Robin",
            price=40,
            is_rover=False,
            start_date="2026-04-29",
            end_date="2026-04-30",
        ),
    ]

    result = send_tomorrow_reminders(
        store,
        now=datetime(2026, 4, 27, 6, 0, tzinfo=timezone.utc),
    )

    assert result == {
        "sent": True,
        "count": 1,
        "target_date": "2026-04-28",
        "email_id": "email_123",
    }
    assert captured_payload["to"] == ["one@example.com", "two@example.com"]
    assert "Alex" in captured_payload["html"]
    assert "85€" in captured_payload["html"]


def test_cron_endpoint_requires_secret_when_configured(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "secret123")
    store = InMemoryReservationStore()
    client = TestClient(create_app(store=store))

    response = client.get("/cron/reminders")

    assert response.status_code == 401


def test_build_reminder_email_includes_private_and_rover_prices():
    email = build_reminder_email(
        [
            Reservation(
                owner_name="Alex",
                dog_name="Milo",
                price=100,
                is_rover=True,
                start_date="2026-04-28",
                end_date="2026-04-29",
            ),
            Reservation(
                owner_name="Paloma",
                dog_name="Robin",
                price=40,
                is_rover=False,
                start_date="2026-04-28",
                end_date="2026-04-29",
            ),
        ],
        target_date=get_target_reminder_date(
            "Europe/Madrid",
            now=datetime(2026, 4, 27, 6, 0, tzinfo=timezone.utc),
        ),
    )

    assert "85€" in email["html"]
    assert "40€" in email["html"]
