from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.assessment import Assessment, AssessmentPentester
from models.checklist import ChecklistTemplate, ChecklistExecution
from schemas.assessment import AssessmentCreate, AssessmentUpdate, AssessmentOut
from services.auth_service import require_any, require_pentester, get_current_user
from services.validation_service import validate_assessment_completion
from models.user import User

router = APIRouter(prefix="/assessments", tags=["Assessments"])


def _load_checklist(assessment_id: UUID, db: Session):
    """Auto-load all checklist template items into checklist_execution for a new assessment."""
    templates = db.query(ChecklistTemplate).all()
    for tmpl in templates:
        entry = ChecklistExecution(assessment_id=assessment_id, check_id=tmpl.id, status="Pending")
        db.add(entry)
    db.commit()


@router.get("", response_model=List[AssessmentOut])
def list_assessments(db: Session = Depends(get_db), _=Depends(require_any)):
    return db.query(Assessment).order_by(Assessment.created_at.desc()).all()


@router.post("", response_model=AssessmentOut, status_code=201)
def create_assessment(
    payload: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = payload.model_dump(exclude={"pentester_ids"})
    data["created_by"] = current_user.id
    assessment = Assessment(**data)
    db.add(assessment)
    db.flush()

    # Assign pentesters
    for uid in (payload.pentester_ids or []):
        db.add(AssessmentPentester(assessment_id=assessment.id, user_id=uid))

    db.commit()
    db.refresh(assessment)

    # Auto-load mandatory checklist
    _load_checklist(assessment.id, db)

    return assessment


@router.get("/{assessment_id}", response_model=AssessmentOut)
def get_assessment(assessment_id: UUID, db: Session = Depends(get_db), _=Depends(require_any)):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return a


@router.put("/{assessment_id}", response_model=AssessmentOut)
def update_assessment(
    assessment_id: UUID,
    payload: AssessmentUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_pentester),
):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    updates = payload.model_dump(exclude_unset=True)

    # If attempting to mark Completed, run validation
    if updates.get("status") == "Completed":
        validate_assessment_completion(assessment_id, db)

    for field, value in updates.items():
        setattr(a, field, value)
    db.commit()
    db.refresh(a)
    return a


@router.delete("/{assessment_id}", status_code=204)
def delete_assessment(assessment_id: UUID, db: Session = Depends(get_db), _=Depends(require_pentester)):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(a)
    db.commit()
