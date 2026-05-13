from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class UserInfo(BaseModel):
    user_id: int
    name: str
    email: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
