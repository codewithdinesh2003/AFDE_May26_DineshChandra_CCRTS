from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime
import os, shutil, uuid

from database import get_db
from models.complaint import Complaint, Attachment
from models.user import User
from schemas.complaint import (
    ComplaintCreate, ComplaintUpdate, ComplaintOut, ComplaintListOut,
    AssignRequest, StatusUpdateRequest,
)
from services.complaint_service import (
    create_complaint, assign_complaint, update_status, escalate_complaint, log_history,
)
from services.notification_service import (
    notify_complaint_created, notify_complaint_assigned,
    notify_status_changed, notify_escalated,
)
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/complaints", tags=["Complaints"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _get_complaint_or_404(db, complaint_id):
    c = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return c


@router.post("/", response_model=ComplaintOut, status_code=201)
def create(data: ComplaintCreate, db: Session = Depends(get_db),
           current_user=Depends(get_current_user)):
    complaint = create_complaint(db, data, current_user.user_id)
    notify_complaint_created(db, complaint, current_user.user_id)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("/", response_model=List[ComplaintListOut])
def list_complaints(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    keyword: Optional[str] = Query(None),
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Complaint)
    role = current_user.role.role_name
    if role == "Customer":
        q = q.filter(Complaint.customer_id == current_user.user_id)
    elif role == "Agent":
        q = q.filter(Complaint.assigned_agent_id == current_user.user_id)
    if status_filter:
        q = q.filter(Complaint.status == status_filter)
    if priority:
        q = q.filter(Complaint.priority == priority)
    if category_id:
        q = q.filter(Complaint.category_id == category_id)
    if keyword:
        like = f"%{keyword}%"
        q = q.filter(or_(Complaint.subject.ilike(like), Complaint.description.ilike(like),
                         Complaint.complaint_number.ilike(like)))
    return q.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/search", response_model=List[ComplaintListOut])
def search(
    keyword: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(Complaint)
    role = current_user.role.role_name
    if role == "Customer":
        q = q.filter(Complaint.customer_id == current_user.user_id)
    elif role == "Agent":
        q = q.filter(Complaint.assigned_agent_id == current_user.user_id)
    if keyword:
        like = f"%{keyword}%"
        q = q.filter(or_(Complaint.subject.ilike(like), Complaint.complaint_number.ilike(like)))
    if status:
        q = q.filter(Complaint.status == status)
    if priority:
        q = q.filter(Complaint.priority == priority)
    if category_id:
        q = q.filter(Complaint.category_id == category_id)
    return q.order_by(Complaint.created_at.desc()).limit(100).all()


@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint(complaint_id: int, db: Session = Depends(get_db),
                  current_user=Depends(get_current_user)):
    c = _get_complaint_or_404(db, complaint_id)
    role = current_user.role.role_name
    if role == "Customer" and c.customer_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if role == "Agent" and c.assigned_agent_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return c


@router.put("/{complaint_id}", response_model=ComplaintOut)
def update_complaint(complaint_id: int, data: ComplaintUpdate,
                     db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    c = _get_complaint_or_404(db, complaint_id)
    role = current_user.role.role_name
    if role == "Customer" and c.customer_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    old_status = c.status
    for field, value in data.model_dump(exclude_unset=True, exclude={"comment", "status"}).items():
        setattr(c, field, value)
    if data.status and data.status != old_status:
        c = update_status(db, c, data.status, current_user.user_id, data.comment)
        notify_status_changed(db, c, c.customer_id, data.status)
    else:
        if data.comment:
            log_history(db, c.complaint_id, current_user.user_id, old_status, old_status, data.comment)
        db.commit()
        db.refresh(c)
    return c


@router.delete("/{complaint_id}", status_code=204)
def delete_complaint(complaint_id: int, db: Session = Depends(get_db),
                     current_user=Depends(get_current_user)):
    if current_user.role.role_name != "Admin":
        raise HTTPException(status_code=403, detail="Admin only")
    c = _get_complaint_or_404(db, complaint_id)
    db.delete(c)
    db.commit()


@router.post("/{complaint_id}/assign", response_model=ComplaintOut)
def assign(complaint_id: int, data: AssignRequest, db: Session = Depends(get_db),
           current_user=Depends(get_current_user)):
    if current_user.role.role_name not in ("Admin", "Supervisor"):
        raise HTTPException(status_code=403, detail="Access denied")
    c = _get_complaint_or_404(db, complaint_id)
    agent = db.query(User).filter(User.user_id == data.agent_id, User.is_active == True).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    c = assign_complaint(db, c, data.agent_id, current_user.user_id, data.comment)
    notify_complaint_assigned(db, c, data.agent_id, c.customer_id)
    db.commit()
    return c


@router.post("/{complaint_id}/escalate", response_model=ComplaintOut)
def escalate(complaint_id: int, data: StatusUpdateRequest = StatusUpdateRequest(status="Escalated"),
             db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role.role_name not in ("Admin", "Supervisor", "Agent"):
        raise HTTPException(status_code=403, detail="Access denied")
    c = _get_complaint_or_404(db, complaint_id)
    c = escalate_complaint(db, c, current_user.user_id, data.comment)
    supervisors = db.query(User).join(User.role).filter(User.role.has(role_name="Supervisor")).all()
    notify_escalated(db, c, c.customer_id, [s.user_id for s in supervisors])
    db.commit()
    return c


@router.post("/{complaint_id}/resolve", response_model=ComplaintOut)
def resolve(complaint_id: int, data: StatusUpdateRequest = StatusUpdateRequest(status="Resolved"),
            db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    c = _get_complaint_or_404(db, complaint_id)
    c = update_status(db, c, "Resolved", current_user.user_id, data.comment or "Complaint resolved")
    notify_status_changed(db, c, c.customer_id, "Resolved")
    db.commit()
    return c


@router.post("/{complaint_id}/close", response_model=ComplaintOut)
def close(complaint_id: int, data: StatusUpdateRequest = StatusUpdateRequest(status="Closed"),
          db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role.role_name not in ("Admin", "Supervisor"):
        raise HTTPException(status_code=403, detail="Access denied")
    c = _get_complaint_or_404(db, complaint_id)
    c = update_status(db, c, "Closed", current_user.user_id, data.comment or "Complaint closed")
    notify_status_changed(db, c, c.customer_id, "Closed")
    db.commit()
    return c


@router.post("/{complaint_id}/reopen", response_model=ComplaintOut)
def reopen(complaint_id: int, data: StatusUpdateRequest = StatusUpdateRequest(status="Open"),
           db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    c = _get_complaint_or_404(db, complaint_id)
    c = update_status(db, c, "Open", current_user.user_id, data.comment or "Complaint reopened")
    db.commit()
    return c


@router.get("/{complaint_id}/history")
def get_history(complaint_id: int, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    c = _get_complaint_or_404(db, complaint_id)
    return [
        {
            "history_id": h.history_id,
            "old_status": h.old_status,
            "new_status": h.new_status,
            "comment": h.comment,
            "updated_at": h.updated_at,
            "updated_by": {"user_id": h.updated_by_user.user_id, "name": h.updated_by_user.name},
        }
        for h in sorted(c.history, key=lambda x: x.updated_at)
    ]


@router.post("/{complaint_id}/attachments")
async def upload_attachment(complaint_id: int, file: UploadFile = File(...),
                            db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    c = _get_complaint_or_404(db, complaint_id)
    ext = os.path.splitext(file.filename)[1]
    saved_name = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, saved_name)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    att = Attachment(complaint_id=complaint_id, file_name=file.filename, file_path=path)
    db.add(att)
    db.commit()
    return {"attachment_id": att.attachment_id, "file_name": file.filename}
