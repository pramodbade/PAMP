"""
Server-side validation rules for assessment completion.
An assessment cannot be marked Completed unless:
  1. All mandatory checklist items are not 'Pending'
  2. All previous findings for the product are verified in this assessment
  3. Any blockers have a reason documented
"""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.checklist import ChecklistExecution, ChecklistTemplate
from models.finding import PreviousFinding, FindingVerification
from models.blocker import Blocker
from models.assessment import Assessment


def validate_assessment_completion(assessment_id: UUID, db: Session) -> None:
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # 1. All mandatory checklist items must be actioned (not Pending)
    pending_mandatory = (
        db.query(ChecklistExecution)
        .join(ChecklistTemplate, ChecklistExecution.check_id == ChecklistTemplate.id)
        .filter(
            ChecklistExecution.assessment_id == assessment_id,
            ChecklistTemplate.mandatory == True,
            ChecklistExecution.status == "Pending",
        )
        .count()
    )
    if pending_mandatory > 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{pending_mandatory} mandatory checklist item(s) are still Pending.",
        )

    # 2. All previous findings for this product must be verified
    product_findings = (
        db.query(PreviousFinding)
        .filter(PreviousFinding.product_id == assessment.product_id)
        .all()
    )
    finding_ids = {f.id for f in product_findings}
    verified_ids = {
        v.finding_id
        for v in db.query(FindingVerification)
        .filter(FindingVerification.assessment_id == assessment_id)
        .all()
    }
    unverified = finding_ids - verified_ids
    if unverified:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{len(unverified)} previous finding(s) have not been verified.",
        )

    # 3. All open blockers must be resolved or have a reason
    open_blockers = (
        db.query(Blocker)
        .filter(
            Blocker.assessment_id == assessment_id,
            Blocker.resolved == False,
            Blocker.end_date == None,
        )
        .count()
    )
    if open_blockers > 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{open_blockers} blocker(s) are still open and unresolved.",
        )
