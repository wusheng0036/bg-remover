from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from src import schemas, crud
from src.database import get_db
from src.models import TaskStatus

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=List[schemas.TaskResponse])
def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[TaskStatus] = None,
    db: Session = Depends(get_db)
):
    """获取任务列表"""
    return crud.get_tasks(db, skip=skip, limit=limit, status=status)


@router.post("/", response_model=schemas.TaskResponse, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    """创建新任务"""
    return crud.create_task(db, task)


@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """获取单个任务"""
    db_task = crud.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return db_task


@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task: schemas.TaskUpdate,
    db: Session = Depends(get_db)
):
    """更新任务"""
    db_task = crud.update_task(db, task_id, task)
    if not db_task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return db_task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """删除任务"""
    if not crud.delete_task(db, task_id):
        raise HTTPException(status_code=404, detail="任务不存在")
    return None


@router.patch("/{task_id}/status", response_model=schemas.TaskResponse)
def update_task_status(
    task_id: int,
    status_update: schemas.TaskStatusUpdate,
    db: Session = Depends(get_db)
):
    """更新任务状态"""
    db_task = crud.update_task_status(db, task_id, status_update.status)
    if not db_task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return db_task
