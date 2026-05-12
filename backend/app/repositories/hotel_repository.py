from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hotel import Hotel, Habitacion, Lugar


async def listar_hoteles(db: AsyncSession) -> list[Hotel]:
    result = await db.execute(
        select(Hotel).options(selectinload(Hotel.lugar))
    )
    return list(result.scalars().all())


async def buscar_hoteles(db: AsyncSession, ciudad: str | None) -> list[Hotel]:
    query = select(Hotel).options(selectinload(Hotel.lugar)).join(Hotel.lugar, isouter=True)
    if ciudad:
        query = query.where(Lugar.nombre.ilike(f"%{ciudad}%"))
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, id_hotel: int) -> Hotel | None:
    result = await db.execute(
        select(Hotel)
        .options(
            selectinload(Hotel.lugar),
            selectinload(Hotel.habitaciones).selectinload(Habitacion.tipo),
        )
        .where(Hotel.id_hotel == id_hotel)
    )
    return result.scalar_one_or_none()
