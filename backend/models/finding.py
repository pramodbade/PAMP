import uuid
from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database import Base


class PreviousFinding(Base):
    __tablename__ = "previous_findings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="SET NULL"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    severity = Column(String(50), nullable=False)  # Informational | Low | Medium | High | Critical
    first_found_date = Column(Date)
    status = Column(String(50), nullable=False, default="Open")  # Open | Fixed | Accepted | Not Applicable
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class FindingVerification(Base):
    __tablename__ = "finding_verification"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    finding_id = Column(UUID(as_uuid=True), ForeignKey("previous_findings.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False)  # Reproduced | Fixed | Not Applicable
    reason = Column(Text)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    verified_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("assessment_id", "finding_id"),)
