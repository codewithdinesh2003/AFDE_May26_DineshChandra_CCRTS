from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Feedback(Base):
    __tablename__ = "feedback"
    feedback_id  = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.complaint_id"), unique=True, nullable=False)
    customer_id  = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    rating       = Column(Integer, nullable=False)
    comments     = Column(Text, nullable=True)
    submitted_at = Column(DateTime, server_default=func.now())

    complaint = relationship("Complaint", back_populates="feedback")
    customer  = relationship("User")
