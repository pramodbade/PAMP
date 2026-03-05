from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "pentester"  # viewer | pentester | lead_pentester | admin


class UserRoleUpdate(BaseModel):
    role: str


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserOut(BaseModel):
    id: UUID
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
