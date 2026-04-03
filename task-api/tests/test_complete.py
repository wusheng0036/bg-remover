#!/usr/bin/env python3
"""
Task API 完整单元测试
包含：正常测试、边界测试、异常测试
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database import Base, get_db
from src.main import app
from src import models

# 测试数据库
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)


def override_get_db():
    """覆盖数据库依赖"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(scope="function")
def setup_database():
    """每个测试前重置数据库"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


class TestHealthCheck:
    """健康检查测试"""
    
    def test_root_endpoint(self):
        """测试根路径"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "Task API" in data["message"]
        assert data["version"] == "1.0.0"
    
    def test_health_endpoint(self):
        """测试健康检查"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestTaskCRUD:
    """任务 CRUD 测试"""
    
    def test_create_task(self, setup_database):
        """测试创建任务"""
        response = client.post("/tasks/", json={
            "title": "测试任务",
            "description": "这是一个测试任务",
            "priority": "high"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "测试任务"
        assert data["priority"] == "high"
        assert data["status"] == "todo"
        assert "id" in data
        assert "created_at" in data
    
    def test_create_task_minimal(self, setup_database):
        """测试最小化创建任务（只传 title）"""
        response = client.post("/tasks/", json={
            "title": "最小任务"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "最小任务"
        assert data["priority"] == "medium"  # 默认值
        assert data["status"] == "todo"  # 默认值
    
    def test_create_task_invalid_title(self, setup_database):
        """测试创建任务 - 无效标题"""
        # 空标题
        response = client.post("/tasks/", json={"title": ""})
        assert response.status_code == 422
        
        # 标题太长
        response = client.post("/tasks/", json={"title": "x" * 201})
        assert response.status_code == 422
    
    def test_get_task(self, setup_database):
        """测试获取单个任务"""
        # 先创建任务
        create_res = client.post("/tasks/", json={"title": "获取测试"})
        task_id = create_res.json()["id"]
        
        # 获取任务
        response = client.get(f"/tasks/{task_id}")
        assert response.status_code == 200
        assert response.json()["title"] == "获取测试"
    
    def test_get_task_not_found(self, setup_database):
        """测试获取不存在的任务"""
        response = client.get("/tasks/99999")
        assert response.status_code == 404
        assert "不存在" in response.json()["detail"]
    
    def test_update_task(self, setup_database):
        """测试更新任务"""
        # 创建任务
        create_res = client.post("/tasks/", json={"title": "旧标题"})
        task_id = create_res.json()["id"]
        
        # 更新任务
        response = client.put(f"/tasks/{task_id}", json={
            "title": "新标题",
            "priority": "low"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "新标题"
        assert data["priority"] == "low"
    
    def test_delete_task(self, setup_database):
        """测试删除任务"""
        # 创建任务
        create_res = client.post("/tasks/", json={"title": "待删除"})
        task_id = create_res.json()["id"]
        
        # 删除任务
        response = client.delete(f"/tasks/{task_id}")
        assert response.status_code == 204
        
        # 确认已删除
        get_res = client.get(f"/tasks/{task_id}")
        assert get_res.status_code == 404
    
    def test_update_task_status(self, setup_database):
        """测试更新任务状态"""
        # 创建任务
        create_res = client.post("/tasks/", json={"title": "状态测试"})
        task_id = create_res.json()["id"]
        
        # 更新状态
        response = client.patch(f"/tasks/{task_id}/status", json={
            "status": "in_progress"
        })
        assert response.status_code == 200
        assert response.json()["status"] == "in_progress"
        
        # 再次更新
        response = client.patch(f"/tasks/{task_id}/status", json={
            "status": "done"
        })
        assert response.json()["status"] == "done"


class TestTaskList:
    """任务列表测试"""
    
    def test_list_tasks_empty(self, setup_database):
        """测试空列表"""
        response = client.get("/tasks/")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_list_tasks(self, setup_database):
        """测试获取任务列表"""
        # 创建多个任务
        for i in range(5):
            client.post("/tasks/", json={"title": f"任务{i}"})
        
        response = client.get("/tasks/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
    
    def test_list_tasks_with_pagination(self, setup_database):
        """测试分页"""
        # 创建 10 个任务
        for i in range(10):
            client.post("/tasks/", json={"title": f"任务{i}"})
        
        # 测试 skip 和 limit
        response = client.get("/tasks/?skip=0&limit=5")
        assert len(response.json()) == 5
        
        response = client.get("/tasks/?skip=5&limit=5")
        assert len(response.json()) == 5
        
        response = client.get("/tasks/?skip=8&limit=5")
        assert len(response.json()) == 2
    
    def test_list_tasks_filter_by_status(self, setup_database):
        """测试按状态筛选"""
        # 创建不同状态的任务
        client.post("/tasks/", json={"title": "任务1"})  # todo
        client.post("/tasks/", json={"title": "任务2"})  # todo
        
        res = client.post("/tasks/", json={"title": "任务3"})
        task_id = res.json()["id"]
        client.patch(f"/tasks/{task_id}/status", json={"status": "done"})
        
        # 筛选 todo
        response = client.get("/tasks/?status=todo")
        assert len(response.json()) == 2
        
        # 筛选 done
        response = client.get("/tasks/?status=done")
        assert len(response.json()) == 1


class TestEdgeCases:
    """边界测试"""
    
    def test_large_title(self, setup_database):
        """测试超长标题"""
        # 200 字符（边界值）
        title = "x" * 200
        response = client.post("/tasks/", json={"title": title})
        assert response.status_code == 201
        assert response.json()["title"] == title
    
    def test_unicode_title(self, setup_database):
        """测试 Unicode 标题"""
        titles = [
            "中文任务",
            "日本語タスク",
            "한국어 작업",
            "Задача",
            "🚀 Emoji 任务"
        ]
        for title in titles:
            response = client.post("/tasks/", json={"title": title})
            assert response.status_code == 201
            assert response.json()["title"] == title
    
    def test_concurrent_create(self, setup_database):
        """测试并发创建"""
        import concurrent.futures
        
        def create_task(i):
            return client.post("/tasks/", json={"title": f"并发任务{i}"})
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(create_task, i) for i in range(20)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        # 检查所有请求都成功
        assert all(r.status_code == 201 for r in results)
        
        # 检查数据库中的任务数
        response = client.get("/tasks/")
        assert len(response.json()) == 20


class TestPerformance:
    """性能测试"""
    
    def test_large_list_response(self, setup_database):
        """测试大数据量列表"""
        # 创建 100 个任务
        for i in range(100):
            client.post("/tasks/", json={
                "title": f"性能测试任务{i}",
                "description": "x" * 1000  # 大描述
            })
        
        # 获取全部
        response = client.get("/tasks/?limit=100")
        assert response.status_code == 200
        assert len(response.json()) == 100


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
