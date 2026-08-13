from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..database.models import User


router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


# =========================================================
# SCHEMAS
# =========================================================

class UserCreate(BaseModel):
    name: str
    email: str
    role: str = "guest"
    avatar: str | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    avatar: str | None

    class Config:
        from_attributes = True


# =========================================================
# CREATE USER
# =========================================================

@router.post("/", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists",
        )

    user = User(
        name=user_data.name.strip(),
        email=user_data.email,
        role=user_data.role,
        avatar=user_data.avatar,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# =========================================================
# GET USER
# =========================================================

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


# =========================================================
# GET USER BY EMAIL
# =========================================================

@router.get(
    "/email/{email}",
    response_model=UserResponse,
)
def get_user_by_email(
    email: str,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user