from pydantic import BaseModel
from decimal import Decimal


class TipoHabitacionSchema(BaseModel):
    id_tip_hab: int
    nombre: str
    cant_pers: int
    precio: Decimal

    model_config = {"from_attributes": True}


class HabitacionSchema(BaseModel):
    num_hab: int
    tipo: TipoHabitacionSchema

    model_config = {"from_attributes": True}


class LugarSchema(BaseModel):
    id_lugar: int
    nombre: str

    model_config = {"from_attributes": True}


class HotelSchema(BaseModel):
    id_hotel: int
    nombre: str
    direccion: str | None
    lugar: LugarSchema | None

    model_config = {"from_attributes": True}


class HotelDetalleSchema(HotelSchema):
    habitaciones: list[HabitacionSchema]
