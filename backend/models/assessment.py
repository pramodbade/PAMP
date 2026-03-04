import uuid
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    environment = Column(String(100), nullable=False)  # Production | Staging | Development | QA
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    estimated_effort_days = Column(Integer)
    lead_pentester = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(String(50), nullable=False, default="Active")  # Active | On Hold | Completed
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AssessmentPentester(Base):
    __tablename__ = "assessment_pentesters"

    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
