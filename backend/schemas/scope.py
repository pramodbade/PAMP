from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ScopeCreate(BaseModel):
    asset_type: str  # Web Application | API | Android Application | iOS Application | Network IP | Cloud Infrastructure | Other
    asset_name: str
    url_or_ip: Optional[str] = None
    notes: Optional[str] = None


class ScopeUpdate(BaseModel):
    asset_type: Optional[str] = None
    asset_name: Optional[str] = None
    url_or_ip: Optional[str] = None
    notes: Optional[str] = None


class ScopeOut(BaseModel):
    id: UUID
    assessment_id: UUID
    asset_type: str
    asset_name: str
    url_or_ip: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
