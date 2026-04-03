from sqlalchemy.orm import Session
from typing import List, Optional
from src import models, schemas


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[models.TaskStatus] = None
) -> List[models.Task]:
    """获取任务列表"""
    query = db.query(models.Task)
    if status:
        query = query.filter(models.Task.status == status)
    return query.offset(skip).limit(limit).all()


def get_task(db: Session, task_id: int) -> Optional[models.Task]:
    """获取单个任务"""
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def create_task(db: Session, task: schemas.TaskCreate) -> models.Task:
    """创建任务"""
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(
    db: Session,
    task_id: int,
    task_update: schemas.TaskUpdate
) -> Optional[models.Task]:
    """更新任务"""
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int) -> bool:
    """删除任务"""
    db_task = get_task(db, task_id)
    if not db_task:
        return False
    
    db.delete(db_task)
    db.commit()
    return True


def update_task_status(
    db: Session,
    task_id: int,
    status: models.TaskStatus
) -> Optional[models.Task]:
    """更新任务状态"""
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    
    db_task.status = status
    db.commit()
    db.refresh(db_task)
    return db_task
