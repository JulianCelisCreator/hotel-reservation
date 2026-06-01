from pydantic import BaseModel


class HotelCreate(BaseModel):
    nombre: str
    direccion: str | None = None
    id_lugar: int


class HotelUpdate(BaseModel):
    nombre: str | None = None
    direccion: str | None = None
    id_lugar: int | None = None


class HotelResponse(BaseModel):
    id_hotel: int
    nombre: str
    direccion: str | None
    id_lugar: int | None

    class Config:
        from_attributes = True