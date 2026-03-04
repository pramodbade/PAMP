from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models.finding import PreviousFinding, FindingVerification
from models.assessment import Assessment
from schemas.finding import (
    FindingCreate, FindingUpdate, FindingOut,
    VerificationCreate, VerificationUpdate, VerificationOut,
)
from services.auth_service import require_any, require_pentester, get_current_user
from models.user import User

router = APIRouter(tags=["Findings"])


# ── Previous Findings (product-level) ────────────────────────────────────────

@router.get("/products/{product_id}/findings", response_model=List[FindingOut])
def list_findings(product_id: UUID, db: Session = Depends(get_db), _=Depends(require_any)):
    return db.query(PreviousFinding).filter(PreviousFinding.product_id == product_id).all()


@router.post("/products/{product_id}/findings", response_model=FindingOut, status_code=201)
def create_finding(product_id: UUID, payload: FindingCreate, db: Session = Depends(get_db), _=Depends(require_pentester)):
    data = payload.model_dump()
    data["product_id"] = product_id
    finding = PreviousFinding(**data)
    db.add(finding)
    db.commit()
    db.refresh(finding)
    return finding


@router.put("/findings/{finding_id}", response_model=FindingOut)
def update_finding(finding_id: UUID, payload: FindingUpdate, db: Session = Depends(get_db), _=Depends(require_pentester)):
    f = db.query(PreviousFinding).filter(PreviousFinding.id == finding_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(f, field, value)
    db.commit()
    db.refresh(f)
    return f


@router.delete("/findings/{finding_id}", status_code=204)
def delete_finding(finding_id: UUID, db: Session = Depends(get_db), _=Depends(require_pentester)):
    f = db.query(PreviousFinding).filter(PreviousFinding.id == finding_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")
    db.delete(f)
    db.commit()


# ── Finding Verifications (assessment-level) ─────────────────────────────────

@router.get("/assessments/{assessment_id}/verifications", response_model=List[VerificationOut])
def list_verifications(assessment_id: UUID, db: Session = Depends(get_db), _=Depends(require_any)):
    return db.query(FindingVerification).filter(FindingVerification.assessment_id == assessment_id).all()


@router.post("/assessments/{assessment_id}/verifications", response_model=VerificationOut, status_code=201)
def create_verification(
    assessment_id: UUID,
    payload: VerificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(FindingVerification).filter(
        FindingVerification.assessment_id == assessment_id,
        FindingVerification.finding_id == payload.finding_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Finding already verified for this assessment")

    v = FindingVerification(
        assessment_id=assessment_id,
        finding_id=payload.finding_id,
        status=payload.status,
        reason=payload.reason,
        verified_by=current_user.id,
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


@router.patch("/assessments/{assessment_id}/verifications/{verification_id}", response_model=VerificationOut)
def update_verification(
    assessment_id: UUID,
    verification_id: UUID,
    payload: VerificationUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_pentester),
):
    v = db.query(FindingVerification).filter(
        FindingVerification.id == verification_id,
        FindingVerification.assessment_id == assessment_id,
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Verification not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(v, field, value)
    db.commit()
    db.refresh(v)
    return v
