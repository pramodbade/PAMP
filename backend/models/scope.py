import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database import Base


class Scope(Base):
    __tablename__ = "scope"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    asset_type = Column(String(100), nullable=False)
    asset_name = Column(String(255), nullable=False)
    url_or_ip = Column(String(500))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
