from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.usuario import Usuarios


async def get_by_correo(db: AsyncSession, correo: str) -> Usuarios | None:
    result = await db.execute(select(Usuarios).where(Usuarios.correo == correo))
    return result.scalar_one_or_none()


async def get_by_usuario(db: AsyncSession, usuario: str) -> Usuarios | None:
    result = await db.execute(select(Usuarios).where(Usuarios.usuario == usuario))
    return result.scalar_one_or_none()


async def create_usuario(db: AsyncSession, usuario: Usuarios) -> Usuarios:
    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)
    return usuario
