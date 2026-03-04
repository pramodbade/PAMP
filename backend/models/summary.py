import uuid
from sqlalchemy import Column, Integer, Text, Date, DateTime, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database import Base


class AssessmentSummary(Base):
    __tablename__ = "assessment_summary"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, unique=True)
    end_date = Column(Date, nullable=False)
    total_findings = Column(Integer, nullable=False, default=0)
    reproduced_findings = Column(Integer, nullable=False, default=0)
    new_findings = Column(Integer, nullable=False, default=0)
    summary_notes = Column(Text)
    report_link = Column(String(1000))
    submitted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
