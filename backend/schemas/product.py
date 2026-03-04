from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProductCreate(BaseModel):
    product_name: str
    owner_team: Optional[str] = None
    business_unit: Optional[str] = None
    risk_level: Optional[str] = None  # Low | Medium | High | Critical
    tech_stack: Optional[str] = None
    description: Optional[str] = None


class ProductUpdate(ProductCreate):
    product_name: Optional[str] = None


class ProductOut(BaseModel):
    id: UUID
    product_name: str
    owner_team: Optional[str]
    business_unit: Optional[str]
    risk_level: Optional[str]
    tech_stack: Optional[str]
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
