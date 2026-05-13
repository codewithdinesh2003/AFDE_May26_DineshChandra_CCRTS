from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ComplaintCreate(BaseModel):
    subject: str
    category_id: Optional[int] = None
    priority: str = "Medium"
    description: str


class ComplaintUpdate(BaseModel):
    subject: Optional[str] = None
    category_id: Optional[int] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    assigned_agent_id: Optional[int] = None
    comment: Optional[str] = None


class AssignRequest(BaseModel):
    agent_id: int
    comment: Optional[str] = None


class StatusUpdateRequest(BaseModel):
    status: str
    comment: Optional[str] = None


class UserBrief(BaseModel):
    user_id: int
    name: str
    email: str
    model_config = {"from_attributes": True}


class CategoryOut(BaseModel):
    category_id: int
    category_name: str
    model_config = {"from_attributes": True}


class HistoryOut(BaseModel):
    history_id: int
    old_status: Optional[str]
    new_status: Optional[str]
    comment: Optional[str]
    updated_at: datetime
    updated_by_user: UserBrief
    model_config = {"from_attributes": True}


class AttachmentOut(BaseModel):
    attachment_id: int
    file_name: Optional[str]
    file_path: Optional[str] = None
    uploaded_at: datetime
    model_config = {"from_attributes": True}


class ComplaintOut(BaseModel):
    complaint_id: int
    complaint_number: str
    subject: str
    description: str
    priority: str
    status: str
    is_escalated: bool
    sla_deadline: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    resolved_at: Optional[datetime]
    customer: UserBrief
    assigned_agent: Optional[UserBrief]
    category: Optional[CategoryOut]
    history: List[HistoryOut] = []
    attachments: List[AttachmentOut] = []
    model_config = {"from_attributes": True}


class ComplaintListOut(BaseModel):
    complaint_id: int
    complaint_number: str
    subject: str
    priority: str
    status: str
    is_escalated: bool
    sla_deadline: Optional[datetime]
    created_at: datetime
    customer: UserBrief
    assigned_agent: Optional[UserBrief]
    category: Optional[CategoryOut]
    model_config = {"from_attributes": True}
