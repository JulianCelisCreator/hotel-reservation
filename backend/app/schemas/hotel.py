""""Schemas para el módulo de hoteles.
This schema defines the data models for the hotel-related endpoints in the Hotel Reservation API.
- It includes Pydantic models for representing hotel information, room details, and location data.
- These models are used for data validation and serialization for API requests and responses.

Autor: JulianCelisCreator

Fecha: 2024-06-01

"""

from decimal import Decimal
from pydantic import BaseModel


class TipoHabitacionSchema(BaseModel):
    """ Schema for representing the type of a hotel room, including 
    - its ID
    - its name
    - its capacity
    - its price.
    """
    id_tip_hab: int
    nombre: str
    cant_pers: int
    precio: Decimal

    model_config = {"from_attributes": True}


class HabitacionSchema(BaseModel):
    """ Schema for representing a hotel room, including its number and type."""
    num_hab: int
    tipo: TipoHabitacionSchema

    model_config = {"from_attributes": True}


class LugarSchema(BaseModel):
    """Schema for representing a location, including its ID and name."""
    id_lugar: int
    nombre: str

    model_config = {"from_attributes": True}


class HotelSchema(BaseModel):
    """Schema for representing a hotel, including its ID, name, address, and location."""
    id_hotel: int
    nombre: str
    direccion: str | None
    lugar: LugarSchema | None

    model_config = {"from_attributes": True}


class HotelDetalleSchema(HotelSchema):
    """Schema for representing detailed information about a hotel, including its rooms."""
    habitaciones: list[HabitacionSchema]
