"""Routers for hotel-related endpoints in the Hotel Reservation API.
This module defines the API endpoints for managing hotels, including:
- Listing all hotels
- Retrieving detailed information about a specific hotel, including its rooms and location.
These endpoints interact with the database using SQLAlchemy's asynchronous sessions and return data validated by Pydantic schemas.
Autor: JulianCelisCreator
Date: 2024-06-01"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.hotel import Hotel, Habitacion, Lugar
from app.schemas.hotel import (
    HabitacionSchema,
    HotelDestacadoSchema,
    HotelDetalleSchema,
    HotelSchema,
)
from app.services import hotel_service

router = APIRouter(prefix="/api/hoteles", tags=["Hoteles"])


@router.get("/", response_model=list[HotelSchema])
async def listar_hoteles(db: AsyncSession = Depends(get_db)):
    """define the endpoint for listing all hotels, including their location information."""
    return await hotel_service.listar_hoteles(db)


@router.get("/buscar", response_model=list[HotelSchema])
async def buscar_hoteles(ciudad: str | None = None, db: AsyncSession = Depends(get_db)):
    """Busca hoteles filtrando por ciudad."""
    return await hotel_service.buscar_hoteles(db, ciudad)


@router.get("/destacados", response_model=list[HotelDestacadoSchema])
async def hoteles_destacados(db: AsyncSession = Depends(get_db)):
    """Hoteles cuya calificación promedio supera el promedio global (subconsulta SQL)."""
    return await hotel_service.hoteles_destacados(db)


@router.get("/{id_hotel}", response_model=HotelDetalleSchema)
async def obtener_hotel(id_hotel: int, db: AsyncSession = Depends(get_db)):
    """Retorna información detallada de un hotel incluyendo habitaciones y ubicación."""
    result = await db.execute(
        select(Hotel)
        .options(
            selectinload(Hotel.lugar).selectinload(Lugar.padre),
            selectinload(Hotel.habitaciones).selectinload(Habitacion.tipo),
        )
        .where(Hotel.id_hotel == id_hotel)
    )
    hotel = result.scalar_one_or_none()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel no encontrado")
    return hotel


@router.get("/{id_hotel}/habitaciones", response_model=list[HabitacionSchema])
async def obtener_habitaciones(id_hotel: int, db: AsyncSession = Depends(get_db)):
    """define the endpoint for retrieving all rooms of a specific hotel."""
    result = await db.execute(
        select(Habitacion)
        .options(selectinload(Habitacion.tipo))
        .where(Habitacion.id_hotel == id_hotel)
    )
    return result.scalars().all()
