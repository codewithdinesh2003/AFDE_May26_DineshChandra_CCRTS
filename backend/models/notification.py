from sqlalchemy import Column, Integer, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Notification(Base):
    __tablename__ = "notifications"
    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id         = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    message         = Column(Text, nullable=False)
    is_read         = Column(Boolean, default=False)
    created_at      = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="notifications")
