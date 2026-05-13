from sqlalchemy.orm import Session
from models.complaint import Complaint, ComplaintHistory
from utils.sla import calculate_sla_deadline
from datetime import datetime


def generate_complaint_number(complaint_id: int) -> str:
    return f"CCRTS-{datetime.utcnow().year}-{str(complaint_id).zfill(5)}"


def log_history(db: Session, complaint_id: int, updated_by: int,
                old_status: str, new_status: str, comment: str = None):
    entry = ComplaintHistory(
        complaint_id=complaint_id,
        updated_by=updated_by,
        old_status=old_status,
        new_status=new_status,
        comment=comment,
    )
    db.add(entry)


def create_complaint(db: Session, data, customer_id: int) -> Complaint:
    complaint = Complaint(
        complaint_number="TEMP",
        customer_id=customer_id,
        category_id=data.category_id,
        subject=data.subject,
        description=data.description,
        priority=data.priority,
        status="Open",
        sla_deadline=calculate_sla_deadline(data.priority),
    )
    db.add(complaint)
    db.flush()
    complaint.complaint_number = generate_complaint_number(complaint.complaint_id)
    log_history(db, complaint.complaint_id, customer_id, None, "Open", "Complaint created")
    db.commit()
    db.refresh(complaint)
    return complaint


def assign_complaint(db: Session, complaint: Complaint, agent_id: int,
                     assigned_by: int, comment: str = None):
    old_status = complaint.status
    complaint.assigned_agent_id = agent_id
    complaint.status = "Assigned"
    log_history(db, complaint.complaint_id, assigned_by, old_status, "Assigned", comment or "Assigned to agent")
    db.commit()
    db.refresh(complaint)
    return complaint


def update_status(db: Session, complaint: Complaint, new_status: str,
                  updated_by: int, comment: str = None):
    old_status = complaint.status
    complaint.status = new_status
    if new_status == "Resolved":
        complaint.resolved_at = datetime.utcnow()
    log_history(db, complaint.complaint_id, updated_by, old_status, new_status, comment)
    db.commit()
    db.refresh(complaint)
    return complaint


def escalate_complaint(db: Session, complaint: Complaint, escalated_by: int, comment: str = None):
    old_status = complaint.status
    complaint.status = "Escalated"
    complaint.is_escalated = True
    log_history(db, complaint.complaint_id, escalated_by, old_status, "Escalated",
                comment or "Complaint escalated")
    db.commit()
    db.refresh(complaint)
    return complaint
