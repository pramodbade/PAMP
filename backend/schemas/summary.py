from __future__ import annotations
from uuid import UUID
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class SummaryCreate(BaseModel):
    end_date: date
    total_findings: int = 0
    reproduced_findings: int = 0
    new_findings: int = 0
    summary_notes: Optional[str] = None
    report_link: Optional[str] = None


class SummaryUpdate(BaseModel):
    end_date: Optional[date] = None
    total_findings: Optional[int] = None
    reproduced_findings: Optional[int] = None
    new_findings: Optional[int] = None
    summary_notes: Optional[str] = None
    report_link: Optional[str] = None


class SummaryOut(BaseModel):
    id: UUID
    assessment_id: UUID
    end_date: date
    total_findings: int
    reproduced_findings: int
    new_findings: int
    summary_notes: Optional[str]
    report_link: Optional[str]
    submitted_by: Optional[UUID]
    submitted_at: datetime

    class Config:
        from_attributes = True
