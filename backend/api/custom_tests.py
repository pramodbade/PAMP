from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.custom_test import CustomTest
from models.assessment import Assessment
from schemas.custom_test import CustomTestCreate, CustomTestUpdate, CustomTestOut
from services.auth_service import require_any, require_pentester, get_current_user
from models.user import User

router = APIRouter(prefix="/assessments/{assessment_id}/custom-tests", tags=["Custom Tests"])


def _get_assessment_or_404(assessment_id: UUID, db: Session):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return a


@router.get("", response_model=List[CustomTestOut])
def list_custom_tests(assessment_id: UUID, db: Session = Depends(get_db), _=Depends(require_any)):
    _get_assessment_or_404(assessment_id, db)
    return db.query(CustomTest).filter(CustomTest.assessment_id == assessment_id).all()


@router.post("", response_model=CustomTestOut, status_code=201)
def create_custom_test(
    assessment_id: UUID,
    payload: CustomTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_assessment_or_404(assessment_id, db)
    test = CustomTest(assessment_id=assessment_id, created_by=current_user.id, **payload.model_dump())
    db.add(test)
    db.commit()
    db.refresh(test)
    return test


@router.put("/{test_id}", response_model=CustomTestOut)
def update_custom_test(
    assessment_id: UUID,
    test_id: UUID,
    payload: CustomTestUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_pentester),
):
    t = db.query(CustomTest).filter(CustomTest.id == test_id, CustomTest.assessment_id == assessment_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Custom test not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(t, field, value)
    db.commit()
    db.refresh(t)
    return t


@router.delete("/{test_id}", status_code=204)
def delete_custom_test(assessment_id: UUID, test_id: UUID, db: Session = Depends(get_db), _=Depends(require_pentester)):
    t = db.query(CustomTest).filter(CustomTest.id == test_id, CustomTest.assessment_id == assessment_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Custom test not found")
    db.delete(t)
    db.commit()
