export type Reservation = {
  id: string;
  owner_name: string;
  dog_name: string;
  price: number;
  is_rover: boolean;
  start_date: string;
  end_date: string;
};

export type ReservationInput = Omit<Reservation, "id">;
