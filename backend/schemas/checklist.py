from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ChecklistTemplateOut(BaseModel):
    id: UUID
    category: str
    test_name: str
    description: Optional[str]
    mandatory: bool
    sort_order: int

    class Config:
        from_attributes = True


class ChecklistExecutionUpdate(BaseModel):
    status: str  # Pending | Completed | Not Applicable | Issue Found
    notes: Optional[str] = None


class ChecklistExecutionOut(BaseModel):
    id: UUID
    assessment_id: UUID
    check_id: UUID
    status: str
    tester: Optional[UUID]
    notes: Optional[str]
    updated_at: datetime
    # Joined template fields
    category: Optional[str] = None
    test_name: Optional[str] = None
    description: Optional[str] = None
    mandatory: Optional[bool] = None
    sort_order: Optional[int] = None

    class Config:
        from_attributes = True
