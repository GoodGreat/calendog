from datetime import date
from uuid import uuid4

from pydantic import BaseModel, Field, model_validator


class ReservationCreate(BaseModel):
    owner_name: str
    dog_name: str
    price: float
    is_rover: bool
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_date_range(self) -> "ReservationCreate":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class Reservation(ReservationCreate):
    id: str = Field(default_factory=lambda: str(uuid4()))
