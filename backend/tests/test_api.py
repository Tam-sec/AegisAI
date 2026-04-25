import pytest
from fastapi.testclient import TestClient
from main import app
from core.database import get_db, Base, engine
from sqlalchemy.orm import Session

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data


def test_login():
    response = client.post(
        "/api/auth/login", json={"username": "admin", "password": "admin123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_unauthorized_access():
    response = client.get("/api/candidates")
    assert response.status_code == 403
