from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.hotel import Hotel, Habitacion, Lugar

_lugar_opts = selectinload(Hotel.lugar).selectinload(Lugar.padre)


async def listar_hoteles(db: AsyncSession) -> list[Hotel]:
    result = await db.execute(
        select(Hotel).options(_lugar_opts)
    )
    return list(result.scalars().all())


async def buscar_hoteles(db: AsyncSession, ciudad: str | None) -> list[Hotel]:
    if not ciudad:
        return await listar_hoteles(db)

    # CTE recursivo: parte de cada lugar y sube por id_lugar_padre,
    # conservando el id_lugar original (id_lugar_raiz) para unirlo al hotel.
    base = (
        select(
            Lugar.id_lugar,
            Lugar.nombre,
            Lugar.id_lugar_padre,
            Lugar.id_lugar.label("id_lugar_raiz"),
        )
        .cte(name="lugar_jerarquia", recursive=True)
    )
    recursive = select(
        Lugar.id_lugar,
        Lugar.nombre,
        Lugar.id_lugar_padre,
        base.c.id_lugar_raiz,
    ).join(base, Lugar.id_lugar == base.c.id_lugar_padre)

    jerarquia = base.union_all(recursive)

    query = (
        select(Hotel)
        .options(_lugar_opts)
        .join(jerarquia, Hotel.id_lugar == jerarquia.c.id_lugar_raiz)
        .where(jerarquia.c.nombre.ilike(f"%{ciudad}%"))
        .distinct()
    )
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, id_hotel: int) -> Hotel | None:
    result = await db.execute(
        select(Hotel)
        .options(
            _lugar_opts,
            selectinload(Hotel.habitaciones).selectinload(Habitacion.tipo),
        )
        .where(Hotel.id_hotel == id_hotel)
    )
    return result.scalar_one_or_none()
