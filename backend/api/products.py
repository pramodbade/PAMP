from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.product import Product
from schemas.product import ProductCreate, ProductUpdate, ProductOut
from services.auth_service import require_any, require_pentester

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db), _=Depends(require_any)):
    return db.query(Product).order_by(Product.product_name).all()


@router.post("", response_model=ProductOut, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), _=Depends(require_pentester)):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: UUID, db: Session = Depends(get_db), _=Depends(require_any)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: UUID, payload: ProductUpdate, db: Session = Depends(get_db), _=Depends(require_pentester)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: UUID, db: Session = Depends(get_db), _=Depends(require_pentester)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
