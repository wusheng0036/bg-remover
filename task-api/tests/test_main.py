import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database import Base, get_db
from src.main import app

# 测试数据库
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(scope="function")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Task API" in response.json()["message"]


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_task(setup_db):
    response = client.post("/tasks/", json={
        "title": "测试任务",
        "description": "这是一个测试",
        "priority": "high"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "测试任务"
    assert data["priority"] == "high"


def test_get_tasks(setup_db):
    # 先创建任务
    client.post("/tasks/", json={"title": "任务1"})
    client.post("/tasks/", json={"title": "任务2"})
    
    response = client.get("/tasks/")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_update_task(setup_db):
    # 创建任务
    create_res = client.post("/tasks/", json={"title": "旧标题"})
    task_id = create_res.json()["id"]
    
    # 更新任务
    response = client.put(f"/tasks/{task_id}", json={"title": "新标题"})
    assert response.status_code == 200
    assert response.json()["title"] == "新标题"


def test_delete_task(setup_db):
    # 创建任务
    create_res = client.post("/tasks/", json={"title": "待删除"})
    task_id = create_res.json()["id"]
    
    # 删除任务
    response = client.delete(f"/tasks/{task_id}")
    assert response.status_code == 204
    
    # 确认已删除
    get_res = client.get(f"/tasks/{task_id}")
    assert get_res.status_code == 404
