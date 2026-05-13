from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None


class FeedbackOut(BaseModel):
    feedback_id: int
    complaint_id: int
    rating: int
    comments: Optional[str]
    submitted_at: datetime
    customer_id: int
    model_config = {"from_attributes": True}
