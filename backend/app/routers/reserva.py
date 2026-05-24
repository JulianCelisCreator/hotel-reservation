from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database import get_db
from app.models.usuario import Usuarios
from app.schemas.reserva import (
    CalificacionCreate,
    HabitacionDisponibleSchema,
    ReservaCreate,
    ReservaOut,
)
from app.services import reserva_service

router = APIRouter(prefix="/api/reservas", tags=["Reservas"])


@router.get("/disponibilidad", response_model=list[HabitacionDisponibleSchema])
async def disponibilidad(
    id_hotel: int = Query(...),
    fecha_inicio: date = Query(...),
    fecha_fin: date = Query(...),
    db: AsyncSession = Depends(get_db),
):
    return await reserva_service.disponibilidad(db, id_hotel, fecha_inicio, fecha_fin)


@router.post("/", response_model=ReservaOut, status_code=201)
async def crear_reserva(
    payload: ReservaCreate,
    db: AsyncSession = Depends(get_db),
    user: Usuarios = Depends(get_current_user),
):
    return await reserva_service.crear_reserva(db, user.id_usuario, payload)


@router.get("/mias", response_model=list[ReservaOut])
async def mis_reservas(
    db: AsyncSession = Depends(get_db),
    user: Usuarios = Depends(get_current_user),
):
    return await reserva_service.listar_mis_reservas(db, user.id_usuario)


@router.patch("/{id_reserva}/cancelar", response_model=ReservaOut)
async def cancelar_reserva_propia(
    id_reserva: int,
    db: AsyncSession = Depends(get_db),
    user: Usuarios = Depends(get_current_user),
):
    return await reserva_service.cancelar_propia(db, id_reserva, user.id_usuario)


@router.post("/{id_reserva}/calificacion", response_model=ReservaOut, status_code=201)
async def calificar_reserva(
    id_reserva: int,
    payload: CalificacionCreate,
    db: AsyncSession = Depends(get_db),
    user: Usuarios = Depends(get_current_user),
):
    return await reserva_service.crear_calificacion(db, id_reserva, user.id_usuario, payload)
