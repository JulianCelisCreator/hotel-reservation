from datetime import date
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hotel import Habitacion
from app.models.reserva import Reserva
from app.repositories import extras_repository, reserva_repository
from app.schemas.reserva import (
    CalificacionCreate,
    CalificacionOut,
    ExtraReservaOut,
    HabitacionDisponibleSchema,
    HabitacionResumen,
    HotelResumen,
    PagoOut,
    ReservaCreate,
    ReservaOut,
    TipoHabResumen,
    UsuarioResumen,
)
from app.models.reserva import Calificacion


def _to_out(reserva: Reserva) -> ReservaOut:
    rh = reserva.habitaciones[0] if reserva.habitaciones else None
    hab = rh.habitacion if rh else None
    hotel = hab.hotel if hab else None

    extras_out = [
        ExtraReservaOut(
            id_extra=re.extra.id_extra,
            nombre=re.extra.nombre,
            precio=re.extra.precio,
            cantidad=re.cantidad,
        )
        for re in reserva.extras
    ]

    pago_out = None
    if reserva.pago is not None:
        pago_out = PagoOut(
            id_pago=reserva.pago.id_pago,
            fecha=reserva.pago.fecha,
            monto=reserva.pago.monto,
            estado=reserva.pago.estado,
            forma_pago=reserva.pago.forma_pago.nombre if reserva.pago.forma_pago else None,
        )

    calif_out = (
        CalificacionOut.model_validate(reserva.calificacion) if reserva.calificacion else None
    )

    return ReservaOut(
        id_reserva=reserva.id_reserva,
        fecha_inicio=reserva.fecha_inicio,
        fecha_fin=reserva.fecha_fin,
        total=reserva.total,
        estado=reserva.estado,
        usuario=UsuarioResumen(
            id_usuario=reserva.usuario.id_usuario,
            nombre_completo=reserva.usuario.nombre_completo,
            correo=reserva.usuario.correo,
        ),
        hotel=HotelResumen(
            id_hotel=hotel.id_hotel if hotel else 0,
            nombre=hotel.nombre if hotel else "",
        ),
        habitacion=HabitacionResumen(
            id_hotel=rh.id_hotel if rh else 0,
            num_hab=rh.num_hab if rh else 0,
            tipo=TipoHabResumen.model_validate(hab.tipo) if hab and hab.tipo else None,
        ),
        extras=extras_out,
        pago=pago_out,
        calificacion=calif_out,
    )


def _validar_fechas(fecha_inicio: date, fecha_fin: date) -> None:
    if fecha_fin <= fecha_inicio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha fin debe ser posterior a la fecha inicio",
        )
    if fecha_inicio < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha inicio no puede ser anterior a hoy",
        )


async def disponibilidad(
    db: AsyncSession,
    id_hotel: int,
    fecha_inicio: date,
    fecha_fin: date,
) -> list[HabitacionDisponibleSchema]:
    _validar_fechas(fecha_inicio, fecha_fin)
    habs = await reserva_repository.habitaciones_disponibles(db, id_hotel, fecha_inicio, fecha_fin)
    return [
        HabitacionDisponibleSchema(
            id_hotel=h.id_hotel,
            num_hab=h.num_hab,
            tipo=TipoHabResumen.model_validate(h.tipo),
        )
        for h in habs
        if h.tipo is not None
    ]


async def crear_reserva(
    db: AsyncSession,
    id_usuario: int,
    payload: ReservaCreate,
) -> ReservaOut:
    _validar_fechas(payload.fecha_inicio, payload.fecha_fin)

    # Cargar habitación + tipo (precio)
    result = await db.execute(
        select(Habitacion).where(
            Habitacion.id_hotel == payload.id_hotel,
            Habitacion.num_hab == payload.num_hab,
        )
    )
    habitacion = result.scalar_one_or_none()
    if habitacion is None:
        raise HTTPException(status_code=404, detail="Habitación no existe")

    await db.refresh(habitacion, ["tipo"])
    if habitacion.tipo is None:
        raise HTTPException(status_code=500, detail="Habitación sin tipo asignado")

    # Verificar disponibilidad
    disponible = await reserva_repository.habitacion_disponible(
        db, payload.id_hotel, payload.num_hab, payload.fecha_inicio, payload.fecha_fin
    )
    if not disponible:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La habitación no está disponible en esas fechas",
        )

    # Validar forma de pago
    forma = await extras_repository.get_forma_pago(db, payload.id_forma_pago)
    if forma is None:
        raise HTTPException(status_code=400, detail="Forma de pago no válida")

    # Calcular total
    noches = (payload.fecha_fin - payload.fecha_inicio).days
    total = Decimal(habitacion.tipo.precio) * noches

    extras_data: list[tuple[int, int]] = []
    if payload.extras:
        ids = [e.id_extra for e in payload.extras]
        cantidades = {e.id_extra: e.cantidad for e in payload.extras}
        extras_db = await extras_repository.get_extras_by_ids(db, ids)
        if len(extras_db) != len(set(ids)):
            raise HTTPException(status_code=400, detail="Algún extra no existe")
        for ex in extras_db:
            cant = cantidades.get(ex.id_extra, 1)
            if cant < 1:
                raise HTTPException(status_code=400, detail="Cantidad de extra inválida")
            total += Decimal(ex.precio) * cant
            extras_data.append((ex.id_extra, cant))

    reserva = await reserva_repository.crear_reserva_completa(
        db,
        id_usuario=id_usuario,
        id_hotel=payload.id_hotel,
        num_hab=payload.num_hab,
        fecha_inicio=payload.fecha_inicio,
        fecha_fin=payload.fecha_fin,
        total=total,
        extras=extras_data,
        id_forma_pago=payload.id_forma_pago,
        fecha_pago=date.today(),
    )
    return _to_out(reserva)


async def listar_mis_reservas(db: AsyncSession, id_usuario: int) -> list[ReservaOut]:
    await reserva_repository.marcar_finalizadas(db)
    reservas = await reserva_repository.listar_por_usuario(db, id_usuario)
    return [_to_out(r) for r in reservas]


async def crear_calificacion(
    db: AsyncSession,
    id_reserva: int,
    id_usuario: int,
    payload: CalificacionCreate,
) -> ReservaOut:
    # Marca finalizadas antes de validar — así una reserva cuya fecha_fin ya pasó está lista para calificar.
    await reserva_repository.marcar_finalizadas(db)

    reserva = await reserva_repository.get_by_id(db, id_reserva)
    if reserva is None:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if reserva.id_usuario != id_usuario:
        raise HTTPException(status_code=403, detail="No puede calificar reservas de otro usuario")
    if reserva.estado != "finalizada":
        raise HTTPException(
            status_code=400,
            detail="Solo puede calificar reservas finalizadas",
        )
    if reserva.calificacion is not None:
        raise HTTPException(status_code=400, detail="Esta reserva ya fue calificada")
    if not 1 <= payload.calificacion <= 5:
        raise HTTPException(status_code=400, detail="La calificación debe estar entre 1 y 5")

    nueva = Calificacion(
        calificacion=payload.calificacion,
        comentario=payload.comentario,
        id_reserva=id_reserva,
    )
    db.add(nueva)
    await db.commit()
    db.expunge_all()  # invalida cache de la sesión para que la próxima query traiga la relación

    refreshed = await reserva_repository.get_by_id(db, id_reserva)
    assert refreshed is not None
    return _to_out(refreshed)


async def cancelar_propia(db: AsyncSession, id_reserva: int, id_usuario: int) -> ReservaOut:
    reserva = await reserva_repository.get_by_id(db, id_reserva)
    if reserva is None:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if reserva.id_usuario != id_usuario:
        raise HTTPException(status_code=403, detail="No puede cancelar reservas de otro usuario")
    if reserva.estado == "cancelada":
        return _to_out(reserva)
    reserva.estado = "cancelada"
    updated = await reserva_repository.actualizar(db, reserva)
    return _to_out(updated)
