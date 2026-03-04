from __future__ import annotations
from uuid import UUID
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel


class AssessmentCreate(BaseModel):
    product_id: UUID
    environment: str  # Production | Staging | Development | QA
    start_date: date
    end_date: Optional[date] = None
    estimated_effort_days: Optional[int] = None
    lead_pentester: Optional[UUID] = None
    pentester_ids: Optional[List[UUID]] = []


class AssessmentUpdate(BaseModel):
    environment: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    estimated_effort_days: Optional[int] = None
    lead_pentester: Optional[UUID] = None
    status: Optional[str] = None  # Active | On Hold | Completed


class AssessmentOut(BaseModel):
    id: UUID
    product_id: UUID
    environment: str
    start_date: date
    end_date: Optional[date]
    estimated_effort_days: Optional[int]
    lead_pentester: Optional[UUID]
    status: str
    created_by: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True
