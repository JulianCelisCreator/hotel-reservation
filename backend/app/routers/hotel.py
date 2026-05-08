from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.hotel import Hotel, Habitacion
from app.schemas.hotel import HotelSchema, HotelDetalleSchema

router = APIRouter(prefix="/api/hoteles", tags=["Hoteles"])


@router.get("/", response_model=list[HotelSchema])
async def listar_hoteles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Hotel).options(selectinload(Hotel.lugar))
    )
    return result.scalars().all()


@router.get("/{id_hotel}", response_model=HotelDetalleSchema)
async def obtener_hotel(id_hotel: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Hotel)
        .options(
            selectinload(Hotel.lugar),
            selectinload(Hotel.habitaciones).selectinload(Habitacion.tipo),
        )
        .where(Hotel.id_hotel == id_hotel)
    )
    hotel = result.scalar_one_or_none()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel no encontrado")
    return hotel
