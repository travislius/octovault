from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Task

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "todo"
    priority: str = "medium"
    created_by: str = "tia"
    tags: str = ""
    notes: str = ""
    due_date: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    created_by: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None
    due_date: Optional[str] = None


def _task_dict(task: Task) -> dict:
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "created_by": task.created_by,
        "tags": task.tags,
        "notes": task.notes,
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "updated_at": task.updated_at.isoformat() if task.updated_at else None,
        "due_date": task.due_date,
    }


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("", tags=["tasks"])
def list_tasks(
    status: Optional[str] = None,
    created_by: Optional[str] = None,
    priority: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Task)
    if status:
        q = q.filter(Task.status == status)
    if created_by:
        q = q.filter(Task.created_by == created_by)
    if priority:
        q = q.filter(Task.priority == priority)
    q = q.order_by(Task.updated_at.desc())
    return [_task_dict(t) for t in q.all()]


@router.post("", tags=["tasks"], status_code=201)
def create_task(
    body: TaskCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = Task(
        title=body.title,
        description=body.description,
        status=body.status,
        priority=body.priority,
        created_by=body.created_by,
        tags=body.tags,
        notes=body.notes,
        due_date=body.due_date,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return _task_dict(task)


@router.patch("/{task_id}", tags=["tasks"])
def update_task(
    task_id: int,
    body: TaskUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    update_data = body.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return _task_dict(task)


@router.delete("/{task_id}", tags=["tasks"])
def delete_task(
    task_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"ok": True}
