from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_admin
from app.database import get_db
from app.schemas.reserva import ReservaOut, ReservaUpdate
from app.services import admin_service

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)


@router.get("/reservas", response_model=list[ReservaOut])
async def listar_reservas(
    id_hotel: int | None = Query(None),
    fecha_desde: date | None = Query(None),
    fecha_hasta: date | None = Query(None),
    estado: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.listar_reservas(db, id_hotel, fecha_desde, fecha_hasta, estado)


@router.get("/reservas/{id_reserva}", response_model=ReservaOut)
async def detalle_reserva(id_reserva: int, db: AsyncSession = Depends(get_db)):
    return await admin_service.get_reserva(db, id_reserva)


@router.put("/reservas/{id_reserva}", response_model=ReservaOut)
async def actualizar_reserva(
    id_reserva: int,
    payload: ReservaUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.actualizar_reserva(db, id_reserva, payload)


@router.patch("/reservas/{id_reserva}/cancelar", response_model=ReservaOut)
async def cancelar_reserva(id_reserva: int, db: AsyncSession = Depends(get_db)):
    return await admin_service.cancelar_reserva(db, id_reserva)
