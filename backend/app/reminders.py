import os
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any, Optional
from zoneinfo import ZoneInfo

import httpx

from .models import Reservation
from .storage import ReservationStore


@dataclass
class ReminderConfig:
    api_key: str
    sender: str
    recipients: list[str]
    timezone: str

    @classmethod
    def from_env(cls) -> "ReminderConfig":
        api_key = os.environ.get("RESEND_API_KEY")
        sender = os.environ.get("REMINDER_FROM_EMAIL")
        recipients_raw = os.environ.get("REMINDER_RECIPIENTS")
        timezone = os.environ.get("REMINDER_TIMEZONE", "Europe/Madrid")

        if not api_key:
            raise RuntimeError("RESEND_API_KEY is not configured.")
        if not sender:
            raise RuntimeError("REMINDER_FROM_EMAIL is not configured.")
        if not recipients_raw:
            raise RuntimeError("REMINDER_RECIPIENTS is not configured.")

        recipients = [item.strip() for item in recipients_raw.split(",") if item.strip()]
        if not recipients:
            raise RuntimeError("REMINDER_RECIPIENTS must contain at least one email address.")

        return cls(
            api_key=api_key,
            sender=sender,
            recipients=recipients,
            timezone=timezone,
        )


def get_target_reminder_date(timezone_name: str, now: Optional[datetime] = None) -> date:
    current_time = now or datetime.now(tz=ZoneInfo("UTC"))
    local_date = current_time.astimezone(ZoneInfo(timezone_name)).date()
    return local_date + timedelta(days=1)


def get_reservations_starting_on(
    reservations: list[Reservation], target_date: date
) -> list[Reservation]:
    return [reservation for reservation in reservations if reservation.start_date == target_date]


def get_net_earnings(reservation: Reservation) -> float:
    return reservation.price * 0.85 if reservation.is_rover else reservation.price


def format_currency(amount: float) -> str:
    rounded = round(amount, 2)
    if rounded.is_integer():
        return f"{int(rounded)}€"
    return f"{rounded:.2f}€"


def build_reminder_email(reservations: list[Reservation], target_date: date) -> dict[str, str]:
    subject = f"CalenDog reminder: {len(reservations)} reservation(s) start on {target_date.isoformat()}"

    line_items = []
    for reservation in reservations:
        source = "Rover" if reservation.is_rover else "Private"
        line_items.append(
            "<li>"
            f"<strong>{reservation.owner_name}</strong> - {reservation.dog_name} "
            f"({format_currency(get_net_earnings(reservation))}, {source})"
            "</li>"
        )

    html = (
        f"<h2>Reservations starting on {target_date.isoformat()}</h2>"
        "<ul>"
        + "".join(line_items)
        + "</ul>"
    )
    text = "\n".join(
        [
            f"Reservations starting on {target_date.isoformat()}:",
            *[
                f"- {reservation.owner_name} - {reservation.dog_name} "
                f"({format_currency(get_net_earnings(reservation))}, "
                f"{'Rover' if reservation.is_rover else 'Private'})"
                for reservation in reservations
            ],
        ]
    )

    return {"subject": subject, "html": html, "text": text}


def send_resend_email(config: ReminderConfig, payload: dict[str, Any]) -> dict[str, Any]:
    response = httpx.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {config.api_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=20.0,
    )
    response.raise_for_status()
    return response.json()


def send_tomorrow_reminders(
    store: ReservationStore, now: Optional[datetime] = None
) -> dict[str, Any]:
    config = ReminderConfig.from_env()
    target_date = get_target_reminder_date(config.timezone, now=now)
    reservations = get_reservations_starting_on(store.list(), target_date)

    if not reservations:
        return {
            "sent": False,
            "count": 0,
            "target_date": target_date.isoformat(),
        }

    content = build_reminder_email(reservations, target_date)
    response = send_resend_email(
        config,
        {
            "from": config.sender,
            "to": config.recipients,
            "subject": content["subject"],
            "html": content["html"],
            "text": content["text"],
        },
    )

    return {
        "sent": True,
        "count": len(reservations),
        "target_date": target_date.isoformat(),
        "email_id": response.get("id"),
    }
