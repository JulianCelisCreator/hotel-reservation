"""Routers for hotel-related endpoints in the Hotel Reservation API.

This module defines the API endpoints for managing hotels, including:
- Listing all hotels
- Searching hotels
- Creating hotels
- Updating hotels
- Deleting hotels
- Retrieving detailed information about a specific hotel

These endpoints interact with the database using SQLAlchemy's asynchronous
sessions and return data validated by Pydantic schemas.

Autor: JulianCelisCreator
Date: 2024-06-01
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.hotel import Hotel, Habitacion, Lugar
from app.repositories import hotel_repository
from app.schemas.hotel import (
    HabitacionSchema,
    HotelDestacadoSchema,
    HotelDetalleSchema,
    HotelSchema,
)
from app.schemas.hotel_crud import (
    HotelCreate,
    HotelUpdate,
    HotelResponse,
)
from app.services import hotel_service

router = APIRouter(
    prefix="/api/hoteles",
    tags=["Hoteles"],
)


# ==================================================
# READ
# ==================================================

@router.get("/", response_model=list[HotelSchema])
async def listar_hoteles(
    db: AsyncSession = Depends(get_db),
):
    """Lista todos los hoteles."""
    return await hotel_service.listar_hoteles(db)


@router.get("/buscar", response_model=list[HotelSchema])
async def buscar_hoteles(
    ciudad: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Busca hoteles filtrando por ciudad."""
    return await hotel_service.buscar_hoteles(
        db,
        ciudad,
    )


@router.get(
    "/destacados",
    response_model=list[HotelDestacadoSchema],
)
async def hoteles_destacados(
    db: AsyncSession = Depends(get_db),
):
    """
    Hoteles cuya calificación promedio supera
    el promedio global (subconsulta SQL).
    """
    return await hotel_service.hoteles_destacados(db)


@router.get(
    "/{id_hotel}",
    response_model=HotelDetalleSchema,
)
async def obtener_hotel(
    id_hotel: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Retorna información detallada de un hotel,
    incluyendo habitaciones y ubicación.
    """
    result = await db.execute(
        select(Hotel)
        .options(
            selectinload(Hotel.lugar)
            .selectinload(Lugar.padre),
            selectinload(Hotel.habitaciones)
            .selectinload(Habitacion.tipo),
        )
        .where(Hotel.id_hotel == id_hotel)
    )

    hotel = result.scalar_one_or_none()

    if not hotel:
        raise HTTPException(
            status_code=404,
            detail="Hotel no encontrado",
        )

    return hotel


@router.get(
    "/{id_hotel}/habitaciones",
    response_model=list[HabitacionSchema],
)
async def obtener_habitaciones(
    id_hotel: int,
    db: AsyncSession = Depends(get_db),
):
    """Obtiene todas las habitaciones de un hotel."""
    result = await db.execute(
        select(Habitacion)
        .options(selectinload(Habitacion.tipo))
        .where(Habitacion.id_hotel == id_hotel)
    )

    return result.scalars().all()


# ==================================================
# CREATE
# ==================================================

@router.post(
    "/",
    response_model=HotelResponse,
    status_code=201,
)
async def crear_hotel(
    hotel_data: HotelCreate,
    db: AsyncSession = Depends(get_db),
):
    """Crea un nuevo hotel."""

    hotel = Hotel(
        nombre=hotel_data.nombre,
        direccion=hotel_data.direccion,
        id_lugar=hotel_data.id_lugar,
    )

    return await hotel_repository.create_hotel(
        db,
        hotel,
    )


# ==================================================
# UPDATE
# ==================================================

@router.put(
    "/{id_hotel}",
    response_model=HotelResponse,
)
async def actualizar_hotel(
    id_hotel: int,
    hotel_data: HotelUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza un hotel existente."""

    hotel = await hotel_repository.update_hotel(
        db,
        id_hotel,
        hotel_data.model_dump(exclude_unset=True),
    )

    if not hotel:
        raise HTTPException(
            status_code=404,
            detail="Hotel no encontrado",
        )

    return hotel


# ==================================================
# DELETE
# ==================================================

@router.delete("/{id_hotel}")
async def eliminar_hotel(
    id_hotel: int,
    db: AsyncSession = Depends(get_db),
):
    """Elimina un hotel."""

    hotel = await hotel_repository.delete_hotel(
        db,
        id_hotel,
    )

    if not hotel:
        raise HTTPException(
            status_code=404,
            detail="Hotel no encontrado",
        )

    return {
        "message": "Hotel eliminado correctamente"
    }