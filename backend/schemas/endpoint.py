from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class EndpointCreate(BaseModel):
    asset_id: Optional[UUID] = None
    path: str
    method: str  # GET | POST | PUT | PATCH | DELETE | HEAD | OPTIONS
    authentication_required: bool = False
    role_required: Optional[str] = None
    notes: Optional[str] = None


class EndpointUpdate(BaseModel):
    path: Optional[str] = None
    method: Optional[str] = None
    authentication_required: Optional[bool] = None
    role_required: Optional[str] = None
    tested_status: Optional[bool] = None
    notes: Optional[str] = None


class EndpointOut(BaseModel):
    id: UUID
    assessment_id: UUID
    asset_id: Optional[UUID]
    path: str
    method: str
    authentication_required: bool
    role_required: Optional[str]
    tested_status: bool
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
