from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.user import UserCreate, UserRoleUpdate, UserStatusUpdate, UserOut
from services.auth_service import require_admin, hash_password

router = APIRouter(prefix="/admin", tags=["Admin"])

VALID_ROLES = {"viewer", "pentester", "lead_pentester", "admin"}


@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(User).order_by(User.created_at).all()


@router.post("/users", response_model=UserOut, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")

    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=409, detail="Username already exists")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already exists")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}/role", response_model=UserOut)
def update_role(user_id: UUID, payload: UserRoleUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}/status", response_model=UserOut)
def update_status(user_id: UUID, payload: UserStatusUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: UUID, db: Session = Depends(get_db), current_admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if str(user.id) == str(current_admin.id):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    db.delete(user)
    db.commit()
