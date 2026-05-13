from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.notification import Notification
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def get_notifications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notifs = (db.query(Notification)
              .filter(Notification.user_id == current_user.user_id)
              .order_by(Notification.created_at.desc())
              .limit(50).all())
    return [
        {
            "notification_id": n.notification_id,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at,
        }
        for n in notifs
    ]


@router.put("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db),
              current_user=Depends(get_current_user)):
    n = db.query(Notification).filter(
        Notification.notification_id == notification_id,
        Notification.user_id == current_user.user_id
    ).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Marked as read"}


@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db.query(Notification).filter(
        Notification.user_id == current_user.user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
