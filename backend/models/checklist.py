import uuid
from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database import Base


class ChecklistTemplate(Base):
    __tablename__ = "checklist_template"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String(100), nullable=False)
    test_name = Column(String(255), nullable=False)
    description = Column(Text)
    mandatory = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ChecklistExecution(Base):
    __tablename__ = "checklist_execution"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    check_id = Column(UUID(as_uuid=True), ForeignKey("checklist_template.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False, default="Pending")  # Pending | Completed | Not Applicable | Issue Found
    tester = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    notes = Column(Text)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("assessment_id", "check_id"),)
