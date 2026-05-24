from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_admin
from app.database import get_db
from app.schemas.reserva import (
    ReservaAdminCreate,
    ReservaOut,
    ReservaUpdate,
    StatsAdmin,
    UsuarioAdmin,
)
from app.services import admin_service

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)


@router.get("/stats", response_model=StatsAdmin)
async def stats(db: AsyncSession = Depends(get_db)):
    """Métricas del dashboard. Consume la vista SQL `vista_stats_admin`."""
    return await admin_service.obtener_stats(db)


@router.get("/reporte/reservas")
async def reporte_reservas(
    estado: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Reporte plano de reservas. Consume la vista SQL `vista_reservas_completa`."""
    return await admin_service.listar_reservas_reporte(db, estado)


@router.get("/reservas", response_model=list[ReservaOut])
async def listar_reservas(
    id_hotel: int | None = Query(None),
    fecha_desde: date | None = Query(None),
    fecha_hasta: date | None = Query(None),
    estado: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    return await admin_service.listar_reservas(db, id_hotel, fecha_desde, fecha_hasta, estado)


@router.post("/reservas", response_model=ReservaOut, status_code=201)
async def crear_reserva(payload: ReservaAdminCreate, db: AsyncSession = Depends(get_db)):
    return await admin_service.crear_reserva_admin(db, payload)


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


@router.delete("/reservas/{id_reserva}", status_code=204)
async def eliminar_reserva(id_reserva: int, db: AsyncSession = Depends(get_db)):
    """Borrado físico de una reserva. Las hijas se eliminan por ON DELETE CASCADE."""
    await admin_service.eliminar_reserva(db, id_reserva)


@router.get("/reservas/{id_reserva}/recalcular-total")
async def recalcular_total(id_reserva: int, db: AsyncSession = Depends(get_db)):
    """Invoca la FUNCTION SQL fn_calcular_total_reserva para verificar el total."""
    return await admin_service.recalcular_total(db, id_reserva)


@router.get("/usuarios", response_model=list[UsuarioAdmin])
async def listar_clientes(db: AsyncSession = Depends(get_db)):
    return await admin_service.listar_clientes(db)


@router.get("/usuarios/{id_usuario}/reservas", response_model=list[ReservaOut])
async def reservas_de_cliente(id_usuario: int, db: AsyncSession = Depends(get_db)):
    return await admin_service.reservas_de_cliente(db, id_usuario)
