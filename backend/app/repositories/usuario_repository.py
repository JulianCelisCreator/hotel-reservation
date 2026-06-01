from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.usuario import Usuarios


async def get_by_correo(db: AsyncSession, correo: str) -> Usuarios | None:
    result = await db.execute(
        select(Usuarios)
        .options(selectinload(Usuarios.tipo_usuario))
        .where(Usuarios.correo == correo)
    )
    return result.scalar_one_or_none()


async def get_by_usuario(db: AsyncSession, usuario: str) -> Usuarios | None:
    result = await db.execute(
        select(Usuarios).where(Usuarios.usuario == usuario)
    )
    return result.scalar_one_or_none()


async def get_by_id(
    db: AsyncSession,
    id_usuario: int
) -> Usuarios | None:
    result = await db.execute(
        select(Usuarios)
        .options(selectinload(Usuarios.tipo_usuario))
        .where(Usuarios.id_usuario == id_usuario)
    )
    return result.scalar_one_or_none()


async def listar_usuarios(
    db: AsyncSession
) -> list[Usuarios]:
    result = await db.execute(
        select(Usuarios)
        .options(selectinload(Usuarios.tipo_usuario))
    )
    return list(result.scalars().all())


async def create_usuario(
    db: AsyncSession,
    usuario: Usuarios
) -> Usuarios:
    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)
    return usuario


async def update_usuario(
    db: AsyncSession,
    id_usuario: int,
    datos: dict
) -> Usuarios | None:
    usuario = await get_by_id(db, id_usuario)

    if not usuario:
        return None

    for campo, valor in datos.items():
        setattr(usuario, campo, valor)

    await db.commit()
    await db.refresh(usuario)

    return usuario


async def delete_usuario(
    db: AsyncSession,
    id_usuario: int
) -> Usuarios | None:
    usuario = await get_by_id(db, id_usuario)

    if not usuario:
        return None

    await db.delete(usuario)
    await db.commit()

    return usuario