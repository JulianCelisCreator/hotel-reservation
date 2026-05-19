from datetime import date

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.hotel import Habitacion, Hotel
from app.models.reserva import Pago, Reserva, ReservaExtra, ReservaHabitacion


_full_load = (
    selectinload(Reserva.usuario),
    selectinload(Reserva.habitaciones).selectinload(ReservaHabitacion.habitacion).selectinload(Habitacion.tipo),
    selectinload(Reserva.habitaciones).selectinload(ReservaHabitacion.habitacion).selectinload(Habitacion.hotel),
    selectinload(Reserva.extras).selectinload(ReservaExtra.extra),
    selectinload(Reserva.pago).selectinload(Pago.forma_pago),
    selectinload(Reserva.calificacion),
)


async def marcar_finalizadas(db: AsyncSession) -> None:
    """Marca como 'finalizada' las reservas confirmadas cuya fecha_fin ya pasó."""
    await db.execute(
        update(Reserva)
        .where(Reserva.estado == "confirmada", Reserva.fecha_fin <= date.today())
        .values(estado="finalizada")
    )
    await db.commit()


async def habitaciones_disponibles(
    db: AsyncSession,
    id_hotel: int,
    fecha_inicio: date,
    fecha_fin: date,
) -> list[Habitacion]:
    """Habitaciones del hotel cuyas fechas NO se solapan con reservas activas."""
    ocupadas = (
        select(ReservaHabitacion.num_hab)
        .join(Reserva, Reserva.id_reserva == ReservaHabitacion.id_reserva)
        .where(
            ReservaHabitacion.id_hotel == id_hotel,
            Reserva.estado != "cancelada",
            Reserva.fecha_inicio < fecha_fin,
            Reserva.fecha_fin > fecha_inicio,
        )
    )

    result = await db.execute(
        select(Habitacion)
        .options(selectinload(Habitacion.tipo))
        .where(Habitacion.id_hotel == id_hotel)
        .where(Habitacion.num_hab.notin_(ocupadas))
        .order_by(Habitacion.num_hab)
    )
    return list(result.scalars().all())


async def habitacion_disponible(
    db: AsyncSession,
    id_hotel: int,
    num_hab: int,
    fecha_inicio: date,
    fecha_fin: date,
    excluir_reserva: int | None = None,
) -> bool:
    query = (
        select(ReservaHabitacion.id_reserva)
        .join(Reserva, Reserva.id_reserva == ReservaHabitacion.id_reserva)
        .where(
            ReservaHabitacion.id_hotel == id_hotel,
            ReservaHabitacion.num_hab == num_hab,
            Reserva.estado != "cancelada",
            Reserva.fecha_inicio < fecha_fin,
            Reserva.fecha_fin > fecha_inicio,
        )
    )
    if excluir_reserva is not None:
        query = query.where(Reserva.id_reserva != excluir_reserva)
    result = await db.execute(query)
    return result.first() is None


async def crear_reserva_completa(
    db: AsyncSession,
    *,
    id_usuario: int,
    id_hotel: int,
    num_hab: int,
    fecha_inicio: date,
    fecha_fin: date,
    total,
    extras: list[tuple[int, int]],
    id_forma_pago: int,
    fecha_pago: date,
) -> Reserva:
    reserva = Reserva(
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        total=total,
        estado="confirmada",
        id_usuario=id_usuario,
    )
    db.add(reserva)
    await db.flush()  # obtiene id_reserva

    db.add(ReservaHabitacion(id_reserva=reserva.id_reserva, id_hotel=id_hotel, num_hab=num_hab))

    for id_extra, cantidad in extras:
        db.add(
            ReservaExtra(
                id_reserva=reserva.id_reserva,
                id_extra=id_extra,
                cantidad=cantidad,
            )
        )

    db.add(
        Pago(
            fecha=fecha_pago,
            monto=total,
            estado="pagado",
            id_reserva=reserva.id_reserva,
            id_forma_pago=id_forma_pago,
        )
    )

    await db.commit()
    return await get_by_id(db, reserva.id_reserva)  # type: ignore[return-value]


async def get_by_id(db: AsyncSession, id_reserva: int) -> Reserva | None:
    result = await db.execute(
        select(Reserva).options(*_full_load).where(Reserva.id_reserva == id_reserva)
    )
    return result.scalar_one_or_none()


async def listar_por_usuario(db: AsyncSession, id_usuario: int) -> list[Reserva]:
    result = await db.execute(
        select(Reserva)
        .options(*_full_load)
        .where(Reserva.id_usuario == id_usuario)
        .order_by(Reserva.fecha_inicio.desc())
    )
    return list(result.scalars().all())


async def listar_todas(
    db: AsyncSession,
    id_hotel: int | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    estado: str | None = None,
) -> list[Reserva]:
    query = select(Reserva).options(*_full_load)

    if id_hotel is not None:
        query = query.join(Reserva.habitaciones).where(ReservaHabitacion.id_hotel == id_hotel)
    if fecha_desde is not None:
        query = query.where(Reserva.fecha_fin > fecha_desde)
    if fecha_hasta is not None:
        query = query.where(Reserva.fecha_inicio < fecha_hasta)
    if estado is not None:
        query = query.where(Reserva.estado == estado)

    query = query.order_by(Reserva.fecha_inicio.desc())
    result = await db.execute(query)
    return list(result.scalars().unique().all())


async def actualizar(db: AsyncSession, reserva: Reserva) -> Reserva:
    await db.commit()
    refreshed = await get_by_id(db, reserva.id_reserva)
    assert refreshed is not None
    return refreshed


async def get_hotel_by_id(db: AsyncSession, id_hotel: int) -> Hotel | None:
    result = await db.execute(select(Hotel).where(Hotel.id_hotel == id_hotel))
    return result.scalar_one_or_none()
