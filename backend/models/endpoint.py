import uuid
from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database import Base


class Endpoint(Base):
    __tablename__ = "endpoints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("scope.id", ondelete="SET NULL"))
    path = Column(String(500), nullable=False)
    method = Column(String(10), nullable=False)  # GET | POST | PUT | PATCH | DELETE | HEAD | OPTIONS
    authentication_required = Column(Boolean, nullable=False, default=False)
    role_required = Column(String(255))
    tested_status = Column(Boolean, nullable=False, default=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
