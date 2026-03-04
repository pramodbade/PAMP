from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from services.auth_service import require_any
from models.assessment import Assessment
from models.product import Product
from models.endpoint import Endpoint
from models.checklist import ChecklistExecution
from models.finding import PreviousFinding

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _assessment_metrics(assessment_id, db: Session) -> dict:
    """Compute endpoint coverage and checklist completion for a single assessment."""
    total_ep = db.query(func.count(Endpoint.id)).filter(Endpoint.assessment_id == assessment_id).scalar() or 0
    tested_ep = (
        db.query(func.count(Endpoint.id))
        .filter(Endpoint.assessment_id == assessment_id, Endpoint.tested_status.is_(True))
        .scalar() or 0
    )
    total_checks = (
        db.query(func.count(ChecklistExecution.id))
        .filter(ChecklistExecution.assessment_id == assessment_id)
        .scalar() or 0
    )
    done_checks = (
        db.query(func.count(ChecklistExecution.id))
        .filter(
            ChecklistExecution.assessment_id == assessment_id,
            ChecklistExecution.status.in_(["Completed", "Not Applicable"]),
        )
        .scalar() or 0
    )
    return {
        "total_endpoints": total_ep,
        "tested_endpoints": tested_ep,
        "endpoint_coverage_pct": round(tested_ep / total_ep * 100, 1) if total_ep else 0,
        "total_checks": total_checks,
        "completed_checks": done_checks,
        "checklist_completion_pct": round(done_checks / total_checks * 100, 1) if total_checks else 0,
    }


@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db), _=Depends(require_any)):
    """Platform-wide summary statistics."""
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_assessments = db.query(func.count(Assessment.id)).scalar() or 0
    active_assessments = (
        db.query(func.count(Assessment.id)).filter(Assessment.status == "Active").scalar() or 0
    )
    completed_assessments = (
        db.query(func.count(Assessment.id)).filter(Assessment.status == "Completed").scalar() or 0
    )
    total_endpoints = db.query(func.count(Endpoint.id)).scalar() or 0
    tested_endpoints = (
        db.query(func.count(Endpoint.id)).filter(Endpoint.tested_status.is_(True)).scalar() or 0
    )
    total_findings = db.query(func.count(PreviousFinding.id)).scalar() or 0
    open_findings = (
        db.query(func.count(PreviousFinding.id)).filter(PreviousFinding.status == "Open").scalar() or 0
    )

    return {
        "total_products": total_products,
        "total_assessments": total_assessments,
        "active_assessments": active_assessments,
        "completed_assessments": completed_assessments,
        "total_endpoints": total_endpoints,
        "tested_endpoints": tested_endpoints,
        "endpoint_coverage_pct": round(tested_endpoints / total_endpoints * 100, 1) if total_endpoints else 0,
        "total_findings": total_findings,
        "open_findings": open_findings,
    }


@router.get("/coverage")
def get_coverage(db: Session = Depends(get_db), _=Depends(require_any)):
    """Per-assessment endpoint coverage and checklist completion metrics."""
    assessments = db.query(Assessment).order_by(Assessment.created_at.desc()).all()

    # Bulk-load product names
    product_ids = list({a.product_id for a in assessments})
    products_map = {
        p.id: p.product_name
        for p in db.query(Product).filter(Product.id.in_(product_ids)).all()
    }

    result = []
    for a in assessments:
        metrics = _assessment_metrics(a.id, db)
        result.append(
            {
                "assessment_id": str(a.id),
                "product_id": str(a.product_id),
                "product_name": products_map.get(a.product_id, "Unknown"),
                "environment": a.environment,
                "status": a.status,
                "start_date": a.start_date.isoformat() if a.start_date else None,
                "end_date": a.end_date.isoformat() if a.end_date else None,
                **metrics,
            }
        )

    return result


@router.get("/heatmap")
def get_heatmap(db: Session = Depends(get_db), _=Depends(require_any)):
    """Per-product assessment heatmap data."""
    products = db.query(Product).order_by(Product.product_name).all()
    result = []

    for p in products:
        assessments = (
            db.query(Assessment)
            .filter(Assessment.product_id == p.id)
            .order_by(Assessment.start_date.desc())
            .all()
        )
        assessment_data = []
        for a in assessments:
            metrics = _assessment_metrics(a.id, db)
            assessment_data.append(
                {
                    "id": str(a.id),
                    "environment": a.environment,
                    "status": a.status,
                    "start_date": a.start_date.isoformat() if a.start_date else None,
                    "end_date": a.end_date.isoformat() if a.end_date else None,
                    **metrics,
                }
            )

        result.append(
            {
                "product_id": str(p.id),
                "product_name": p.product_name,
                "risk_level": p.risk_level,
                "owner_team": p.owner_team,
                "assessment_count": len(assessments),
                "assessments": assessment_data,
            }
        )

    return result


@router.get("/search")
def global_search(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    _=Depends(require_any),
):
    """Global search across products, assessments, and findings."""
    term = f"%{q.lower()}%"

    products = (
        db.query(Product)
        .filter(
            func.lower(Product.product_name).like(term)
            | func.lower(Product.owner_team).like(term)
            | func.lower(Product.description).like(term)
        )
        .limit(10)
        .all()
    )

    findings = (
        db.query(PreviousFinding)
        .filter(
            func.lower(PreviousFinding.title).like(term)
            | func.lower(PreviousFinding.description).like(term)
        )
        .limit(10)
        .all()
    )

    return {
        "query": q,
        "products": [
            {
                "id": str(p.id),
                "name": p.product_name,
                "type": "product",
                "subtitle": p.owner_team or "",
                "risk_level": p.risk_level,
            }
            for p in products
        ],
        "findings": [
            {
                "id": str(f.id),
                "name": f.title,
                "type": "finding",
                "subtitle": f.severity,
                "product_id": str(f.product_id),
                "status": f.status,
            }
            for f in findings
        ],
    }


@router.get("/products/{product_id}/timeline")
def get_product_timeline(
    product_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_any),
):
    """Assessment history timeline for a specific product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    assessments = (
        db.query(Assessment)
        .filter(Assessment.product_id == product_id)
        .order_by(Assessment.start_date.desc())
        .all()
    )

    result = []
    for a in assessments:
        metrics = _assessment_metrics(a.id, db)
        result.append(
            {
                "id": str(a.id),
                "environment": a.environment,
                "status": a.status,
                "start_date": a.start_date.isoformat() if a.start_date else None,
                "end_date": a.end_date.isoformat() if a.end_date else None,
                **metrics,
            }
        )

    return result
