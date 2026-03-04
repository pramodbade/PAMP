from __future__ import annotations
from uuid import UUID
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class BlockerCreate(BaseModel):
    start_date: date
    end_date: Optional[date] = None
    reason: str
    expected_resolution: Optional[date] = None


class BlockerUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reason: Optional[str] = None
    expected_resolution: Optional[date] = None
    resolved: Optional[bool] = None


class BlockerOut(BaseModel):
    id: UUID
    assessment_id: UUID
    start_date: date
    end_date: Optional[date]
    reason: str
    expected_resolution: Optional[date]
    resolved: bool
    created_by: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True
