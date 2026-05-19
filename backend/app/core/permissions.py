from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user
from app.database import get_db
from app.models.usuario import Usuarios


async def get_current_user_with_role(
    user: Usuarios = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Usuarios:
    result = await db.execute(
        select(Usuarios)
        .options(selectinload(Usuarios.tipo_usuario))
        .where(Usuarios.id_usuario == user.id_usuario)
    )
    fresh = result.scalar_one()
    return fresh


def require_role(rol: str):
    async def _checker(user: Usuarios = Depends(get_current_user_with_role)) -> Usuarios:
        if user.tipo_usuario is None or user.tipo_usuario.rol != rol:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para esta acción",
            )
        return user

    return _checker


require_admin = require_role("administrador")
