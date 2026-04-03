from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from src.models import TaskStatus, TaskPriority


# 共享属性
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None


# 创建任务
class TaskCreate(TaskBase):
    pass


# 更新任务
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None


# 返回任务
class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# 状态更新
class TaskStatusUpdate(BaseModel):
    status: TaskStatus
