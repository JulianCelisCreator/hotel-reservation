from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.repositories import extras_repository
from app.schemas.reserva import ExtraSchema, FormaPagoSchema

router = APIRouter(prefix="/api", tags=["Catálogo"])


@router.get("/extras", response_model=list[ExtraSchema])
async def listar_extras(db: AsyncSession = Depends(get_db)):
    return await extras_repository.listar_extras(db)


@router.get("/formas-pago", response_model=list[FormaPagoSchema])
async def listar_formas_pago(db: AsyncSession = Depends(get_db)):
    return await extras_repository.listar_formas_pago(db)
