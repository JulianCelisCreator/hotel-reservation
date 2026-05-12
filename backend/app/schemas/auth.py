from datetime import date
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    correo: str
    password: str


class RegisterRequest(BaseModel):
    nombre_completo: str
    correo: str
    usuario: str
    password: str
    fecha_nacimiento: date


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserOut(BaseModel):
    id_usuario: int
    nombre_completo: str
    correo: str
    usuario: str

    model_config = {"from_attributes": True}
