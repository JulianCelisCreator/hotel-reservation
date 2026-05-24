from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reserva import Reserva
from app.models.usuario import TipoUsuario, Usuarios
from app.repositories import reserva_repository
from app.schemas.reserva import (
    ReservaAdminCreate,
    ReservaCreate,
    ReservaOut,
    ReservaUpdate,
    UsuarioAdmin,
)
from app.services import reserva_service
from app.services.reserva_service import _to_out


async def obtener_stats(db: AsyncSession) -> dict:
    """Devuelve totales de reservas agrupados por estado.

    Consume la vista SQL `vista_stats_admin` definida en creation.sql.
    La vista calcula los conteos por estado, ingresos totales y ticket
    promedio en una sola consulta agregada.
    """
    await reserva_repository.marcar_finalizadas(db)

    result = await db.execute(text("SELECT * FROM vista_stats_admin"))
    row = result.mappings().one()
    return {
        "total": row["total"],
        "pendiente": row["pendiente"],
        "confirmada": row["confirmada"],
        "finalizada": row["finalizada"],
        "cancelada": row["cancelada"],
        "ingresos_totales": float(row["ingresos_totales"]),
        "ticket_promedio": float(row["ticket_promedio"]),
    }


async def listar_reservas_reporte(db: AsyncSession, estado: str | None = None) -> list[dict]:
    """Reporte plano de reservas usando la vista `vista_reservas_completa`.

    La vista une 7 tablas (reserva, usuarios, reserva_habitacion, hotel,
    lugar, habitacion, tipo_habitacion, pago, forma_pago, calificaciones)
    en una sola fila por reserva. Útil para exportar datos sin cargar
    relaciones del ORM.
    """
    await reserva_repository.marcar_finalizadas(db)

    if estado:
        sql = text(
            "SELECT * FROM vista_reservas_completa "
            "WHERE estado_reserva = :estado "
            "ORDER BY fecha_inicio DESC"
        )
        result = await db.execute(sql, {"estado": estado})
    else:
        sql = text("SELECT * FROM vista_reservas_completa ORDER BY fecha_inicio DESC")
        result = await db.execute(sql)

    return [dict(row) for row in result.mappings().all()]


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


async def eliminar_reserva(db: AsyncSession, id_reserva: int) -> None:
    """Borra definitivamente una reserva. CASCADE elimina sus hijas."""
    ok = await reserva_repository.eliminar_reserva(db, id_reserva)
    if not ok:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")


async def recalcular_total(db: AsyncSession, id_reserva: int) -> dict:
    """Invoca fn_calcular_total_reserva (FUNCTION SQL) y compara con el guardado."""
    reserva = await reserva_repository.get_by_id(db, id_reserva)
    if reserva is None:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    calculado = await reserva_repository.recalcular_total_sql(db, id_reserva)
    return {
        "id_reserva": id_reserva,
        "total_guardado": float(reserva.total),
        "total_calculado_funcion_sql": float(calculado) if calculado is not None else None,
        "coincide": float(reserva.total) == (float(calculado) if calculado else 0),
    }


async def listar_clientes(db: AsyncSession) -> list[UsuarioAdmin]:
    """Lista todos los clientes con su conteo de reservas."""
    result = await db.execute(
        select(
            Usuarios.id_usuario,
            Usuarios.nombre_completo,
            Usuarios.correo,
            Usuarios.usuario,
            Usuarios.fecha_registro,
            func.count(Reserva.id_reserva).label("num_reservas"),
        )
        .join(TipoUsuario, TipoUsuario.id_tipo_usuario == Usuarios.id_tipo_usuario)
        .outerjoin(Reserva, Reserva.id_usuario == Usuarios.id_usuario)
        .where(TipoUsuario.rol == "cliente")
        .group_by(Usuarios.id_usuario)
        .order_by(Usuarios.nombre_completo)
    )
    return [
        UsuarioAdmin(
            id_usuario=row.id_usuario,
            nombre_completo=row.nombre_completo,
            correo=row.correo,
            usuario=row.usuario,
            fecha_registro=row.fecha_registro,
            num_reservas=row.num_reservas,
        )
        for row in result.all()
    ]


async def reservas_de_cliente(db: AsyncSession, id_usuario: int) -> list[ReservaOut]:
    await reserva_repository.marcar_finalizadas(db)
    reservas = await reserva_repository.listar_por_usuario(db, id_usuario)
    return [_to_out(r) for r in reservas]


async def crear_reserva_admin(db: AsyncSession, payload: ReservaAdminCreate) -> ReservaOut:
    # Validar que el cliente existe
    result = await db.execute(select(Usuarios).where(Usuarios.id_usuario == payload.id_usuario))
    cliente = result.scalar_one_or_none()
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    base = ReservaCreate(
        id_hotel=payload.id_hotel,
        num_hab=payload.num_hab,
        fecha_inicio=payload.fecha_inicio,
        fecha_fin=payload.fecha_fin,
        extras=payload.extras,
        id_forma_pago=payload.id_forma_pago,
    )
    return await reserva_service.crear_reserva(db, payload.id_usuario, base)
