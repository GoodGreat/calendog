import json

from fastapi.testclient import TestClient

from backend.app.main import create_app


def test_create_reservation_persists_to_file(tmp_path):
    data_file = tmp_path / "reservations.json"
    client = TestClient(create_app(data_file))

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

    persisted = json.loads(data_file.read_text(encoding="utf-8"))
    assert persisted[0]["owner_name"] == "Alex"
