from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User, Role
from schemas.user import UserCreate, UserUpdate, UserOut
from services.auth_service import hash_password
from middleware.auth_middleware import get_current_user, admin_only

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(admin_only)):
    return db.query(User).all()


@router.get("/roles")
def list_roles(db: Session = Depends(get_db), _=Depends(get_current_user)):
    roles = db.query(Role).all()
    return [{"role_id": r.role_id, "role_name": r.role_name} for r in roles]


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=UserOut, status_code=201)
def create_user(data: UserCreate, db: Session = Depends(get_db), _=Depends(admin_only)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role_id=data.role_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), _=Depends(admin_only)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def deactivate_user(user_id: int, db: Session = Depends(get_db), _=Depends(admin_only)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}
