from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, generate_salt, hash_password, verify_password
from app.models.usuario import TipoUsuario, Usuarios
from app.repositories import usuario_repository
from sqlalchemy import select


async def login(db: AsyncSession, correo: str, password: str) -> dict:
    user = await usuario_repository.get_by_correo(db, correo)
    if not user or not verify_password(password, user.salt, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )
    token = create_access_token({"sub": str(user.id_usuario), "rol": _get_rol(user)})
    return {"access_token": token, "token_type": "bearer"}


async def register(
    db: AsyncSession,
    nombre_completo: str,
    correo: str,
    usuario: str,
    password: str,
    fecha_nacimiento: date,
) -> dict:
    if await usuario_repository.get_by_correo(db, correo):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El correo ya está registrado")
    if await usuario_repository.get_by_usuario(db, usuario):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El nombre de usuario ya existe")

    result = await db.execute(select(TipoUsuario).where(TipoUsuario.rol == "CLIENTE"))
    tipo = result.scalar_one_or_none()
    if tipo is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Rol CLIENTE no configurado")

    salt = generate_salt()
    new_user = Usuarios(
        nombre_completo=nombre_completo,
        correo=correo,
        usuario=usuario,
        password_hash=hash_password(password, salt),
        salt=salt,
        fecha_nacimiento=fecha_nacimiento,
        id_tipo_usuario=tipo.id_tipo_usuario,
    )
    await usuario_repository.create_usuario(db, new_user)
    token = create_access_token({"sub": str(new_user.id_usuario), "rol": "CLIENTE"})
    return {"access_token": token, "token_type": "bearer"}


def _get_rol(user: Usuarios) -> str:
    if user.tipo_usuario:
        return user.tipo_usuario.rol
    return "CLIENTE"
