from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.feedback import Feedback
from models.complaint import Complaint
from schemas.feedback import FeedbackCreate, FeedbackOut
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("/{complaint_id}", response_model=FeedbackOut, status_code=201)
def submit_feedback(complaint_id: int, data: FeedbackCreate,
                    db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    c = db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if c.customer_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only submit feedback for your own complaints")
    if c.status not in ("Resolved", "Closed"):
        raise HTTPException(status_code=400, detail="Feedback can only be submitted after resolution")
    if db.query(Feedback).filter(Feedback.complaint_id == complaint_id).first():
        raise HTTPException(status_code=400, detail="Feedback already submitted")
    fb = Feedback(complaint_id=complaint_id, customer_id=current_user.user_id,
                  rating=data.rating, comments=data.comments)
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb


@router.get("/", response_model=List[FeedbackOut])
def list_feedback(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role.role_name not in ("Admin", "Supervisor", "QualityTeam"):
        raise HTTPException(status_code=403, detail="Access denied")
    return db.query(Feedback).order_by(Feedback.submitted_at.desc()).all()


@router.get("/{complaint_id}", response_model=FeedbackOut)
def get_feedback(complaint_id: int, db: Session = Depends(get_db),
                 current_user=Depends(get_current_user)):
    fb = db.query(Feedback).filter(Feedback.complaint_id == complaint_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="No feedback for this complaint")
    return fb
