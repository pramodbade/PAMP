from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.summary import AssessmentSummary
from models.assessment import Assessment
from schemas.summary import SummaryCreate, SummaryUpdate, SummaryOut
from services.auth_service import require_any, require_pentester, get_current_user
from services.validation_service import validate_assessment_completion
from models.user import User

router = APIRouter(prefix="/assessments/{assessment_id}/summary", tags=["Assessment Summary"])


@router.get("", response_model=SummaryOut)
def get_summary(assessment_id: UUID, db: Session = Depends(get_db), _=Depends(require_any)):
    s = db.query(AssessmentSummary).filter(AssessmentSummary.assessment_id == assessment_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Summary not yet created")
    return s


@router.post("", response_model=SummaryOut, status_code=201)
def create_summary(
    assessment_id: UUID,
    payload: SummaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    existing = db.query(AssessmentSummary).filter(AssessmentSummary.assessment_id == assessment_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Summary already exists. Use PUT to update.")

    # Validate completion requirements
    validate_assessment_completion(assessment_id, db)

    summary = AssessmentSummary(
        assessment_id=assessment_id,
        submitted_by=current_user.id,
        **payload.model_dump(),
    )
    db.add(summary)

    # Mark assessment as Completed
    a.status = "Completed"
    a.end_date = payload.end_date

    db.commit()
    db.refresh(summary)
    return summary


@router.put("", response_model=SummaryOut)
def update_summary(
    assessment_id: UUID,
    payload: SummaryUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_pentester),
):
    s = db.query(AssessmentSummary).filter(AssessmentSummary.assessment_id == assessment_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Summary not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    db.commit()
    db.refresh(s)
    return s
