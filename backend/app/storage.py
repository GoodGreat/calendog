import os
from typing import Optional, Protocol

from .models import Reservation


class ReservationStore(Protocol):
    def list(self) -> list[Reservation]:
        ...

    def create(self, reservation: Reservation) -> Reservation:
        ...

    def update(self, reservation_id: str, reservation: Reservation) -> Optional[Reservation]:
        ...

    def delete(self, reservation_id: str) -> bool:
        ...


class PostgresReservationStore:
    def __init__(self, database_url: str) -> None:
        self.database_url = database_url

    @classmethod
    def from_env(cls) -> "PostgresReservationStore":
        database_url = os.environ.get("DATABASE_URL")
        if not database_url:
            raise RuntimeError(
                "DATABASE_URL is not configured. Set it to your Supabase transaction pooler URL."
            )
        return cls(database_url)

    def _connect(self):
        try:
            import psycopg
            from psycopg.rows import dict_row
        except ImportError as exc:
            raise RuntimeError(
                "psycopg is required for database access. Install backend dependencies first."
            ) from exc

        return psycopg.connect(self.database_url, row_factory=dict_row)

    def _normalize_row(self, row: dict) -> dict:
        normalized = dict(row)
        normalized["id"] = str(normalized["id"])
        return normalized

    def list(self) -> list[Reservation]:
        query = """
            select id, owner_name, dog_name, price, is_rover, start_date, end_date
            from public.reservations
            order by start_date, end_date, created_at, id
        """
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(query)
                rows = cursor.fetchall()
        return [Reservation.model_validate(self._normalize_row(row)) for row in rows]

    def create(self, reservation: Reservation) -> Reservation:
        query = """
            insert into public.reservations (
                id,
                owner_name,
                dog_name,
                price,
                is_rover,
                start_date,
                end_date
            )
            values (%s, %s, %s, %s, %s, %s, %s)
            returning id, owner_name, dog_name, price, is_rover, start_date, end_date
        """
        payload = (
            reservation.id,
            reservation.owner_name,
            reservation.dog_name,
            reservation.price,
            reservation.is_rover,
            reservation.start_date,
            reservation.end_date,
        )
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(query, payload)
                row = cursor.fetchone()
            connection.commit()
        return Reservation.model_validate(self._normalize_row(row))

    def update(self, reservation_id: str, reservation: Reservation) -> Optional[Reservation]:
        query = """
            update public.reservations
            set owner_name = %s,
                dog_name = %s,
                price = %s,
                is_rover = %s,
                start_date = %s,
                end_date = %s
            where id = %s
            returning id, owner_name, dog_name, price, is_rover, start_date, end_date
        """
        payload = (
            reservation.owner_name,
            reservation.dog_name,
            reservation.price,
            reservation.is_rover,
            reservation.start_date,
            reservation.end_date,
            reservation_id,
        )
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(query, payload)
                row = cursor.fetchone()
            connection.commit()
        if row is None:
            return None
        return Reservation.model_validate(self._normalize_row(row))

    def delete(self, reservation_id: str) -> bool:
        query = """
            delete from public.reservations
            where id = %s
        """
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(query, (reservation_id,))
                deleted = cursor.rowcount > 0
            connection.commit()
        return deleted
