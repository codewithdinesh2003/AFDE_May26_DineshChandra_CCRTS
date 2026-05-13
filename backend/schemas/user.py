from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role_id: int


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None


class RoleOut(BaseModel):
    role_id: int
    role_name: str
    model_config = {"from_attributes": True}


class UserOut(BaseModel):
    user_id: int
    name: str
    email: str
    role: RoleOut
    is_active: bool
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
