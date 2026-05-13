from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, Role
from schemas.auth import LoginRequest, TokenResponse, RegisterRequest, UserInfo
from services.auth_service import authenticate_user, create_access_token, hash_password
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/debug")
def debug(db: Session = Depends(get_db)):
    import bcrypt as _bcrypt
    from passlib.context import CryptContext
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    user = db.query(User).filter(User.email == "admin@ccrts.com").first()
    if not user:
        return {"error": "user not found"}
    test_verify = pwd.verify("Admin@1234", user.password_hash)
    return {
        "bcrypt_version": _bcrypt.__version__,
        "user_found": True,
        "is_active": user.is_active,
        "hash_prefix": user.password_hash[:10],
        "verify_result": test_verify,
    }


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.user_id), "role": user.role.role_name})
    return TokenResponse(
        access_token=token,
        user=UserInfo(user_id=user.user_id, name=user.name, email=user.email, role=user.role.role_name),
    )


@router.post("/register", status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    customer_role = db.query(Role).filter(Role.role_name == "Customer").first()
    if not customer_role:
        raise HTTPException(status_code=500, detail="Customer role not found")
    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role_id=customer_role.role_id,
    )
    db.add(user)
    db.commit()
    return {"message": "Registration successful"}


@router.get("/me")
def get_me(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return {
        "user_id": current_user.user_id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.role_name,
        "is_active": current_user.is_active,
    }
