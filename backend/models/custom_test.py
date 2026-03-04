import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database import Base


class CustomTest(Base):
    __tablename__ = "custom_tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    test_name = Column(String(255), nullable=False)
    area = Column(String(255))
    description = Column(Text)
    status = Column(String(50), nullable=False, default="Pending")  # Pending | Completed | Not Applicable | Issue Found
    notes = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
