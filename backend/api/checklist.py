from uuid import UUID
from typing import List, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.checklist import ChecklistExecution, ChecklistTemplate
from models.assessment import Assessment
from schemas.checklist import ChecklistExecutionUpdate, ChecklistExecutionOut
from services.auth_service import require_any, require_pentester, get_current_user
from models.user import User

router = APIRouter(prefix="/assessments/{assessment_id}/checklist", tags=["Checklist"])


@router.get("", response_model=List[ChecklistExecutionOut])
def get_checklist(assessment_id: UUID, db: Session = Depends(get_db), _=Depends(require_any)):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    rows = (
        db.query(ChecklistExecution, ChecklistTemplate)
        .join(ChecklistTemplate, ChecklistExecution.check_id == ChecklistTemplate.id)
        .filter(ChecklistExecution.assessment_id == assessment_id)
        .order_by(ChecklistTemplate.sort_order)
        .all()
    )

    result = []
    for exe, tmpl in rows:
        out = ChecklistExecutionOut(
            id=exe.id,
            assessment_id=exe.assessment_id,
            check_id=exe.check_id,
            status=exe.status,
            tester=exe.tester,
            notes=exe.notes,
            updated_at=exe.updated_at,
            category=tmpl.category,
            test_name=tmpl.test_name,
            description=tmpl.description,
            mandatory=tmpl.mandatory,
            sort_order=tmpl.sort_order,
        )
        result.append(out)
    return result


@router.patch("/{execution_id}", response_model=ChecklistExecutionOut)
def update_checklist_item(
    assessment_id: UUID,
    execution_id: UUID,
    payload: ChecklistExecutionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exe = db.query(ChecklistExecution).filter(
        ChecklistExecution.id == execution_id,
        ChecklistExecution.assessment_id == assessment_id,
    ).first()
    if not exe:
        raise HTTPException(status_code=404, detail="Checklist item not found")

    exe.status = payload.status
    if payload.notes is not None:
        exe.notes = payload.notes
    exe.tester = current_user.id
    db.commit()
    db.refresh(exe)

    tmpl = db.query(ChecklistTemplate).filter(ChecklistTemplate.id == exe.check_id).first()
    return ChecklistExecutionOut(
        id=exe.id,
        assessment_id=exe.assessment_id,
        check_id=exe.check_id,
        status=exe.status,
        tester=exe.tester,
        notes=exe.notes,
        updated_at=exe.updated_at,
        category=tmpl.category if tmpl else None,
        test_name=tmpl.test_name if tmpl else None,
        description=tmpl.description if tmpl else None,
        mandatory=tmpl.mandatory if tmpl else None,
        sort_order=tmpl.sort_order if tmpl else None,
    )
