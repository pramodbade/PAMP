from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.auth import LoginRequest, TokenResponse, ChangePasswordRequest
from services.auth_service import verify_password, hash_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username, User.is_active == True).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, role=user.role, username=user.username)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
    }


@router.post("/change-password", status_code=204)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 8 characters")

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
