from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.scope import Scope
from models.assessment import Assessment
from schemas.scope import ScopeCreate, ScopeUpdate, ScopeOut
from services.auth_service import require_any, require_pentester

router = APIRouter(prefix="/assessments/{assessment_id}/scope", tags=["Scope"])


def _get_assessment_or_404(assessment_id: UUID, db: Session):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return a


@router.get("", response_model=List[ScopeOut])
def list_scope(assessment_id: UUID, db: Session = Depends(get_db), _=Depends(require_any)):
    _get_assessment_or_404(assessment_id, db)
    return db.query(Scope).filter(Scope.assessment_id == assessment_id).all()


@router.post("", response_model=ScopeOut, status_code=201)
def add_scope(assessment_id: UUID, payload: ScopeCreate, db: Session = Depends(get_db), _=Depends(require_pentester)):
    _get_assessment_or_404(assessment_id, db)
    item = Scope(assessment_id=assessment_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{scope_id}", response_model=ScopeOut)
def update_scope(assessment_id: UUID, scope_id: UUID, payload: ScopeUpdate, db: Session = Depends(get_db), _=Depends(require_pentester)):
    item = db.query(Scope).filter(Scope.id == scope_id, Scope.assessment_id == assessment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Scope item not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{scope_id}", status_code=204)
def delete_scope(assessment_id: UUID, scope_id: UUID, db: Session = Depends(get_db), _=Depends(require_pentester)):
    item = db.query(Scope).filter(Scope.id == scope_id, Scope.assessment_id == assessment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Scope item not found")
    db.delete(item)
    db.commit()
