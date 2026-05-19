from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_user_with_role
from app.database import get_db
from app.models.usuario import Usuarios
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserMeOut
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.login(db, body.correo, body.password)


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.register(
        db,
        nombre_completo=body.nombre_completo,
        correo=body.correo,
        usuario=body.usuario,
        password=body.password,
        fecha_nacimiento=body.fecha_nacimiento,
    )


@router.get("/me", response_model=UserMeOut)
async def me(user: Usuarios = Depends(get_current_user_with_role)):
    return UserMeOut(
        id_usuario=user.id_usuario,
        nombre_completo=user.nombre_completo,
        correo=user.correo,
        usuario=user.usuario,
        rol=user.tipo_usuario.rol if user.tipo_usuario else "",
    )
