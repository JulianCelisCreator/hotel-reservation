from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import reserva_repository
from app.schemas.reserva import ReservaOut, ReservaUpdate
from app.services.reserva_service import _to_out


async def listar_reservas(
    db: AsyncSession,
    id_hotel: int | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    estado: str | None = None,
) -> list[ReservaOut]:
    await reserva_repository.marcar_finalizadas(db)
    reservas = await reserva_repository.listar_todas(db, id_hotel, fecha_desde, fecha_hasta, estado)
    return [_to_out(r) for r in reservas]


async def get_reserva(db: AsyncSession, id_reserva: int) -> ReservaOut:
    reserva = await reserva_repository.get_by_id(db, id_reserva)
    if reserva is None:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return _to_out(reserva)


async def actualizar_reserva(
    db: AsyncSession,
    id_reserva: int,
    payload: ReservaUpdate,
) -> ReservaOut:
    reserva = await reserva_repository.get_by_id(db, id_reserva)
    if reserva is None:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    nueva_inicio = payload.fecha_inicio or reserva.fecha_inicio
    nueva_fin = payload.fecha_fin or reserva.fecha_fin

    if nueva_fin <= nueva_inicio:
        raise HTTPException(status_code=400, detail="Fechas inválidas")

    rh = reserva.habitaciones[0] if reserva.habitaciones else None
    if rh is None:
        raise HTTPException(status_code=500, detail="Reserva sin habitación")

    nuevo_num_hab = payload.num_hab if payload.num_hab is not None else rh.num_hab
    cambios_disponibilidad = (
        payload.fecha_inicio is not None
        or payload.fecha_fin is not None
        or payload.num_hab is not None
    )

    if cambios_disponibilidad and (payload.estado or reserva.estado) != "cancelada":
        disponible = await reserva_repository.habitacion_disponible(
            db,
            id_hotel=rh.id_hotel,
            num_hab=nuevo_num_hab,
            fecha_inicio=nueva_inicio,
            fecha_fin=nueva_fin,
            excluir_reserva=reserva.id_reserva,
        )
        if not disponible:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="La habitación no está disponible para esas fechas",
            )

    reserva.fecha_inicio = nueva_inicio
    reserva.fecha_fin = nueva_fin
    if payload.num_hab is not None:
        rh.num_hab = payload.num_hab
    if payload.estado is not None:
        if payload.estado not in ("pendiente", "confirmada", "cancelada", "finalizada"):
            raise HTTPException(status_code=400, detail="Estado inválido")
        reserva.estado = payload.estado

    updated = await reserva_repository.actualizar(db, reserva)
    return _to_out(updated)


async def cancelar_reserva(db: AsyncSession, id_reserva: int) -> ReservaOut:
    reserva = await reserva_repository.get_by_id(db, id_reserva)
    if reserva is None:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if reserva.estado == "cancelada":
        return _to_out(reserva)
    reserva.estado = "cancelada"
    updated = await reserva_repository.actualizar(db, reserva)
    return _to_out(updated)
