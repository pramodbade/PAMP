from __future__ import annotations
from uuid import UUID
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class FindingCreate(BaseModel):
    product_id: UUID
    title: str
    description: Optional[str] = None
    severity: str  # Informational | Low | Medium | High | Critical
    first_found_date: Optional[date] = None
    status: str = "Open"  # Open | Fixed | Accepted | Not Applicable


class FindingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    first_found_date: Optional[date] = None
    status: Optional[str] = None


class FindingOut(BaseModel):
    id: UUID
    product_id: UUID
    assessment_id: Optional[UUID]
    title: str
    description: Optional[str]
    severity: str
    first_found_date: Optional[date]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class VerificationCreate(BaseModel):
    finding_id: UUID
    status: str  # Reproduced | Fixed | Not Applicable
    reason: Optional[str] = None


class VerificationUpdate(BaseModel):
    status: Optional[str] = None
    reason: Optional[str] = None


class VerificationOut(BaseModel):
    id: UUID
    assessment_id: UUID
    finding_id: UUID
    status: str
    reason: Optional[str]
    verified_by: Optional[UUID]
    verified_at: datetime

    class Config:
        from_attributes = True
