from datetime import datetime, timedelta

SLA_HOURS = {"Critical": 4, "High": 24, "Medium": 48, "Low": 72}


def calculate_sla_deadline(priority: str) -> datetime:
    hours = SLA_HOURS.get(priority, 48)
    return datetime.utcnow() + timedelta(hours=hours)


def is_sla_breached(sla_deadline, status: str) -> bool:
    if status in ("Resolved", "Closed"):
        return False
    if sla_deadline is None:
        return False
    return datetime.utcnow() > sla_deadline
