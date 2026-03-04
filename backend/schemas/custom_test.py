from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CustomTestCreate(BaseModel):
    test_name: str
    area: Optional[str] = None
    description: Optional[str] = None
    status: str = "Pending"
    notes: Optional[str] = None


class CustomTestUpdate(BaseModel):
    test_name: Optional[str] = None
    area: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class CustomTestOut(BaseModel):
    id: UUID
    assessment_id: UUID
    test_name: str
    area: Optional[str]
    description: Optional[str]
    status: str
    notes: Optional[str]
    created_by: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True
