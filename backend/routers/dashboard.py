from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
from models.complaint import Complaint, Category
from models.user import User
from middleware.auth_middleware import get_current_user
from utils.sla import is_sla_breached

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/categories")
def list_categories(db: Session = Depends(get_db), _=Depends(get_current_user)):
    cats = db.query(Category).order_by(Category.category_name).all()
    return [{"category_id": c.category_id, "category_name": c.category_name} for c in cats]


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(Complaint)
    role = current_user.role.role_name
    if role == "Customer":
        q = q.filter(Complaint.customer_id == current_user.user_id)
    elif role == "Agent":
        q = q.filter(Complaint.assigned_agent_id == current_user.user_id)

    all_complaints = q.all()
    now = datetime.utcnow()
    sla_breached = sum(1 for c in all_complaints
                       if c.sla_deadline and c.status not in ("Resolved", "Closed")
                       and now > c.sla_deadline)
    return {
        "total":      len(all_complaints),
        "open":       sum(1 for c in all_complaints if c.status == "Open"),
        "in_progress":sum(1 for c in all_complaints if c.status == "In Progress"),
        "resolved":   sum(1 for c in all_complaints if c.status == "Resolved"),
        "closed":     sum(1 for c in all_complaints if c.status == "Closed"),
        "escalated":  sum(1 for c in all_complaints if c.status == "Escalated"),
        "sla_breached": sla_breached,
    }


@router.get("/trends")
def get_trends(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    months = []
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0)
        month_end   = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
        count = db.query(func.count(Complaint.complaint_id)).filter(
            Complaint.created_at >= month_start,
            Complaint.created_at < month_end,
        ).scalar()
        months.append({"month": month_start.strftime("%b %Y"), "count": count})
    return months


@router.get("/category-breakdown")
def category_breakdown(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = (db.query(Category.category_name, func.count(Complaint.complaint_id))
            .join(Complaint, Complaint.category_id == Category.category_id, isouter=True)
            .group_by(Category.category_name).all())
    return [{"category": r[0], "count": r[1]} for r in rows]


@router.get("/sla-status")
def sla_status(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    complaints = db.query(Complaint).filter(Complaint.sla_deadline.isnot(None)).all()
    now = datetime.utcnow()
    on_time  = sum(1 for c in complaints if c.status in ("Resolved","Closed") or now <= c.sla_deadline)
    breached = sum(1 for c in complaints if c.status not in ("Resolved","Closed") and now > c.sla_deadline)
    return {"on_time": on_time, "breached": breached}


@router.get("/agent-performance")
def agent_performance(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role.role_name not in ("Admin", "Supervisor", "QualityTeam"):
        return []
    agents = db.query(User).join(User.role).filter(User.role.has(role_name="Agent")).all()
    result = []
    for agent in agents:
        comps = db.query(Complaint).filter(Complaint.assigned_agent_id == agent.user_id).all()
        resolved = [c for c in comps if c.resolved_at]
        avg_time = 0.0
        if resolved:
            times = [(c.resolved_at - c.created_at).total_seconds() / 3600 for c in resolved]
            avg_time = round(sum(times) / len(times), 1)
        result.append({
            "agent_id": agent.user_id,
            "name": agent.name,
            "total": len(comps),
            "resolved": len(resolved),
            "avg_resolution_hours": avg_time,
        })
    return result
