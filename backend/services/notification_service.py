from sqlalchemy.orm import Session
from models.notification import Notification


def create_notification(db: Session, user_id: int, message: str):
    notif = Notification(user_id=user_id, message=message)
    db.add(notif)
    db.flush()


def notify_complaint_created(db: Session, complaint, customer_id: int):
    create_notification(db, customer_id, f"Your complaint {complaint.complaint_number} has been submitted successfully.")


def notify_complaint_assigned(db: Session, complaint, agent_id: int, customer_id: int):
    create_notification(db, agent_id, f"Complaint {complaint.complaint_number} has been assigned to you.")
    create_notification(db, customer_id, f"Your complaint {complaint.complaint_number} has been assigned to an agent.")


def notify_status_changed(db: Session, complaint, customer_id: int, new_status: str):
    create_notification(db, customer_id, f"Your complaint {complaint.complaint_number} status changed to '{new_status}'.")


def notify_escalated(db: Session, complaint, customer_id: int, supervisor_ids: list):
    create_notification(db, customer_id, f"Your complaint {complaint.complaint_number} has been escalated for urgent attention.")
    for sid in supervisor_ids:
        create_notification(db, sid, f"Complaint {complaint.complaint_number} has been escalated — action required.")
