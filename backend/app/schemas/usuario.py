from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.usuario import Usuarios
from app.repositories import usuario_repository
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioResponse,
)
from app.core.security import (
    generate_salt,
    hash_password,
)

router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"],
)


@router.get("/", response_model=list[UsuarioResponse])
async def listar_usuarios(
    db: AsyncSession = Depends(get_db),
):
    return await usuario_repository.listar_usuarios(db)


@router.get("/{id_usuario}", response_model=UsuarioResponse)
async def obtener_usuario(
    id_usuario: int,
    db: AsyncSession = Depends(get_db),
):
    usuario = await usuario_repository.get_by_id(
        db,
        id_usuario,
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado",
        )

    return usuario


@router.post(
    "/",
    response_model=UsuarioResponse,
    status_code=201,
)
async def crear_usuario(
    body: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
):
    salt = generate_salt()

    usuario = Usuarios(
        nombre_completo=body.nombre_completo,
        correo=body.correo,
        usuario=body.usuario,
        password_hash=hash_password(
            body.password,
            salt,
        ),
        salt=salt,
        fecha_nacimiento=body.fecha_nacimiento,
        id_tipo_usuario=body.id_tipo_usuario,
    )

    return await usuario_repository.create_usuario(
        db,
        usuario,
    )


@router.put(
    "/{id_usuario}",
    response_model=UsuarioResponse,
)
async def actualizar_usuario(
    id_usuario: int,
    body: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
):
    usuario = await usuario_repository.update_usuario(
        db,
        id_usuario,
        body.model_dump(exclude_unset=True),
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado",
        )

    return usuario


@router.delete("/{id_usuario}")
async def eliminar_usuario(
    id_usuario: int,
    db: AsyncSession = Depends(get_db),
):
    usuario = await usuario_repository.delete_usuario(
        db,
        id_usuario,
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado",
        )

    return {
        "message": "Usuario eliminado correctamente"
    }