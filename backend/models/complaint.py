from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Category(Base):
    __tablename__ = "categories"
    category_id   = Column(Integer, primary_key=True, autoincrement=True)
    category_name = Column(String(100), nullable=False)
    complaints    = relationship("Complaint", back_populates="category")


class Complaint(Base):
    __tablename__ = "complaints"
    complaint_id     = Column(Integer, primary_key=True, autoincrement=True)
    complaint_number = Column(String(20), unique=True, nullable=False)
    customer_id      = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    assigned_agent_id= Column(Integer, ForeignKey("users.user_id"), nullable=True)
    category_id      = Column(Integer, ForeignKey("categories.category_id"), nullable=True)
    subject          = Column(String(255), nullable=False)
    description      = Column(Text, nullable=False)
    priority         = Column(Enum("Low","Medium","High","Critical"), default="Medium")
    status           = Column(
        Enum("Open","Assigned","In Progress","Pending Customer Response","Escalated","Resolved","Closed"),
        default="Open"
    )
    sla_deadline  = Column(DateTime, nullable=True)
    is_escalated  = Column(Boolean, default=False)
    created_at    = Column(DateTime, server_default=func.now())
    updated_at    = Column(DateTime, server_default=func.now(), onupdate=func.now())
    resolved_at   = Column(DateTime, nullable=True)

    customer       = relationship("User", foreign_keys=[customer_id], back_populates="complaints_as_customer")
    assigned_agent = relationship("User", foreign_keys=[assigned_agent_id], back_populates="complaints_as_agent")
    category       = relationship("Category", back_populates="complaints")
    history        = relationship("ComplaintHistory", back_populates="complaint", cascade="all, delete-orphan")
    attachments    = relationship("Attachment", back_populates="complaint", cascade="all, delete-orphan")
    feedback       = relationship("Feedback", back_populates="complaint", uselist=False)


class ComplaintHistory(Base):
    __tablename__ = "complaint_history"
    history_id   = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.complaint_id"), nullable=False)
    updated_by   = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    old_status   = Column(String(50), nullable=True)
    new_status   = Column(String(50), nullable=True)
    comment      = Column(Text, nullable=True)
    updated_at   = Column(DateTime, server_default=func.now())

    complaint        = relationship("Complaint", back_populates="history")
    updated_by_user  = relationship("User", back_populates="history_entries")


class Attachment(Base):
    __tablename__ = "attachments"
    attachment_id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id  = Column(Integer, ForeignKey("complaints.complaint_id"), nullable=False)
    file_name     = Column(String(255))
    file_path     = Column(String(500))
    uploaded_at   = Column(DateTime, server_default=func.now())

    complaint = relationship("Complaint", back_populates="attachments")
