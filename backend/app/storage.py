import json
from pathlib import Path

from .models import Reservation


class ReservationStore:
    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.file_path.exists():
            self.file_path.write_text("[]", encoding="utf-8")

    def list(self) -> list[Reservation]:
        raw = json.loads(self.file_path.read_text(encoding="utf-8"))
        return [Reservation.model_validate(item) for item in raw]

    def create(self, reservation: Reservation) -> Reservation:
        reservations = self.list()
        reservations.append(reservation)
        payload = [item.model_dump(mode="json") for item in reservations]
        self.file_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return reservation
