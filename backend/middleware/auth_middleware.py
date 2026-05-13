from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError
from database import get_db
from services.auth_service import decode_token, get_user_by_id

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = decode_token(credentials.credentials)
        user_id = int(payload.get("sub"))
    except (JWTError, Exception):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def require_roles(*roles):
    def dependency(current_user=Depends(get_current_user)):
        if current_user.role.role_name not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(roles)}"
            )
        return current_user
    return dependency


def admin_only(current_user=Depends(get_current_user)):
    if current_user.role.role_name != "Admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def admin_or_supervisor(current_user=Depends(get_current_user)):
    if current_user.role.role_name not in ("Admin", "Supervisor"):
        raise HTTPException(status_code=403, detail="Admin or Supervisor access required")
    return current_user
