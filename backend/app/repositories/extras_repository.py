from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reserva import Extras, FormaPago


async def listar_extras(db: AsyncSession) -> list[Extras]:
    result = await db.execute(select(Extras).order_by(Extras.nombre))
    return list(result.scalars().all())


async def get_extras_by_ids(db: AsyncSession, ids: list[int]) -> list[Extras]:
    if not ids:
        return []
    result = await db.execute(select(Extras).where(Extras.id_extra.in_(ids)))
    return list(result.scalars().all())


async def listar_formas_pago(db: AsyncSession) -> list[FormaPago]:
    result = await db.execute(select(FormaPago).order_by(FormaPago.nombre))
    return list(result.scalars().all())


async def get_forma_pago(db: AsyncSession, id_forma_pago: int) -> FormaPago | None:
    result = await db.execute(select(FormaPago).where(FormaPago.id_forma_pago == id_forma_pago))
    return result.scalar_one_or_none()
