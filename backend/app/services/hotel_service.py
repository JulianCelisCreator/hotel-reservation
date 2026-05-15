from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hotel import Hotel
from app.repositories import hotel_repository


async def listar_hoteles(db: AsyncSession) -> list[Hotel]:
    return await hotel_repository.listar_hoteles(db)


async def buscar_hoteles(db: AsyncSession, ciudad: str | None) -> list[Hotel]:
    return await hotel_repository.buscar_hoteles(db, ciudad)


async def get_hotel_by_id(db: AsyncSession, id_hotel: int) -> Hotel | None:
    return await hotel_repository.get_by_id(db, id_hotel)
