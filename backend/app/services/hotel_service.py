from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hotel import Hotel
from app.repositories import hotel_repository
from app.schemas.hotel import HotelDestacadoSchema


async def listar_hoteles(db: AsyncSession) -> list[Hotel]:
    return await hotel_repository.listar_hoteles(db)


async def buscar_hoteles(db: AsyncSession, ciudad: str | None) -> list[Hotel]:
    return await hotel_repository.buscar_hoteles(db, ciudad)


async def get_hotel_by_id(db: AsyncSession, id_hotel: int) -> Hotel | None:
    return await hotel_repository.get_by_id(db, id_hotel)


async def hoteles_destacados(db: AsyncSession) -> list[HotelDestacadoSchema]:
    """
    R5 - Subconsulta: retorna hoteles cuyo promedio de calificación supera
    el promedio global de todas las calificaciones del sistema.

    La subconsulta (SELECT AVG(calificacion) FROM calificaciones) se evalúa
    en el HAVING para comparar contra el promedio de cada hotel.
    """
    sql = text("""
        SELECT
            h.id_hotel,
            h.nombre,
            h.direccion,
            l.nombre                  AS ciudad,
            ROUND(AVG(c.calificacion)::numeric, 2) AS promedio_calificacion
        FROM hotel h
        LEFT JOIN lugar l
               ON l.id_lugar = h.id_lugar
        JOIN habitacion hab
               ON hab.id_hotel = h.id_hotel
        JOIN reserva_habitacion rh
               ON rh.id_hotel = hab.id_hotel
              AND rh.num_hab  = hab.num_hab
        JOIN calificaciones c
               ON c.id_reserva = rh.id_reserva
        GROUP BY h.id_hotel, h.nombre, h.direccion, l.nombre
        HAVING AVG(c.calificacion) > (
            SELECT AVG(calificacion) FROM calificaciones
        )
        ORDER BY promedio_calificacion DESC
    """)
    result = await db.execute(sql)
    rows = result.mappings().all()
    return [HotelDestacadoSchema(**row) for row in rows]
