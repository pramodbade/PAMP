from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.blocker import Blocker
from models.assessment import Assessment
from schemas.blocker import BlockerCreate, BlockerUpdate, BlockerOut
from services.auth_service import require_any, require_pentester, get_current_user
from models.user import User

router = APIRouter(prefix="/assessments/{assessment_id}/blockers", tags=["Blockers"])


def _get_assessment_or_404(assessment_id: UUID, db: Session):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return a


@router.get("", response_model=List[BlockerOut])
def list_blockers(assessment_id: UUID, db: Session = Depends(get_db), _=Depends(require_any)):
    _get_assessment_or_404(assessment_id, db)
    return db.query(Blocker).filter(Blocker.assessment_id == assessment_id).order_by(Blocker.start_date).all()


@router.post("", response_model=BlockerOut, status_code=201)
def create_blocker(
    assessment_id: UUID,
    payload: BlockerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_assessment_or_404(assessment_id, db)
    blocker = Blocker(assessment_id=assessment_id, created_by=current_user.id, **payload.model_dump())
    db.add(blocker)
    db.commit()
    db.refresh(blocker)
    return blocker


@router.put("/{blocker_id}", response_model=BlockerOut)
def update_blocker(
    assessment_id: UUID,
    blocker_id: UUID,
    payload: BlockerUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_pentester),
):
    b = db.query(Blocker).filter(Blocker.id == blocker_id, Blocker.assessment_id == assessment_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Blocker not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(b, field, value)
    db.commit()
    db.refresh(b)
    return b


@router.delete("/{blocker_id}", status_code=204)
def delete_blocker(assessment_id: UUID, blocker_id: UUID, db: Session = Depends(get_db), _=Depends(require_pentester)):
    b = db.query(Blocker).filter(Blocker.id == blocker_id, Blocker.assessment_id == assessment_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Blocker not found")
    db.delete(b)
    db.commit()
