from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Role(Base):
    __tablename__ = "roles"
    role_id   = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), unique=True, nullable=False)
    users     = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"
    user_id       = Column(Integer, primary_key=True, autoincrement=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id       = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    is_active     = Column(Boolean, default=True, server_default="1")
    created_at    = Column(DateTime, server_default=func.now())

    role                   = relationship("Role", back_populates="users")
    complaints_as_customer = relationship("Complaint", foreign_keys="[Complaint.customer_id]", back_populates="customer")
    complaints_as_agent    = relationship("Complaint", foreign_keys="[Complaint.assigned_agent_id]", back_populates="assigned_agent")
    notifications          = relationship("Notification", back_populates="user")
    history_entries        = relationship("ComplaintHistory", back_populates="updated_by_user")
