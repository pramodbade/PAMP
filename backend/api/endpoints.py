from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.endpoint import Endpoint
from models.assessment import Assessment
from schemas.endpoint import EndpointCreate, EndpointUpdate, EndpointOut
from services.auth_service import require_any, require_pentester

router = APIRouter(prefix="/assessments/{assessment_id}/endpoints", tags=["Endpoints"])


def _get_assessment_or_404(assessment_id: UUID, db: Session):
    a = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return a


@router.get("", response_model=List[EndpointOut])
def list_endpoints(assessment_id: UUID, db: Session = Depends(get_db), _=Depends(require_any)):
    _get_assessment_or_404(assessment_id, db)
    return db.query(Endpoint).filter(Endpoint.assessment_id == assessment_id).all()


@router.post("", response_model=EndpointOut, status_code=201)
def create_endpoint(assessment_id: UUID, payload: EndpointCreate, db: Session = Depends(get_db), _=Depends(require_pentester)):
    _get_assessment_or_404(assessment_id, db)
    ep = Endpoint(assessment_id=assessment_id, **payload.model_dump())
    db.add(ep)
    db.commit()
    db.refresh(ep)
    return ep


@router.put("/{endpoint_id}", response_model=EndpointOut)
def update_endpoint(assessment_id: UUID, endpoint_id: UUID, payload: EndpointUpdate, db: Session = Depends(get_db), _=Depends(require_pentester)):
    ep = db.query(Endpoint).filter(Endpoint.id == endpoint_id, Endpoint.assessment_id == assessment_id).first()
    if not ep:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ep, field, value)
    db.commit()
    db.refresh(ep)
    return ep


@router.delete("/{endpoint_id}", status_code=204)
def delete_endpoint(assessment_id: UUID, endpoint_id: UUID, db: Session = Depends(get_db), _=Depends(require_pentester)):
    ep = db.query(Endpoint).filter(Endpoint.id == endpoint_id, Endpoint.assessment_id == assessment_id).first()
    if not ep:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    db.delete(ep)
    db.commit()
