from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class ExtraSchema(BaseModel):
    id_extra: int
    nombre: str
    precio: Decimal

    model_config = {"from_attributes": True}


class FormaPagoSchema(BaseModel):
    id_forma_pago: int
    nombre: str

    model_config = {"from_attributes": True}


class TipoHabResumen(BaseModel):
    id_tip_hab: int
    nombre: str
    cant_pers: int
    precio: Decimal

    model_config = {"from_attributes": True}


class HabitacionDisponibleSchema(BaseModel):
    id_hotel: int
    num_hab: int
    tipo: TipoHabResumen


class ExtraReservaIn(BaseModel):
    id_extra: int
    cantidad: int = 1


class ReservaCreate(BaseModel):
    id_hotel: int
    num_hab: int
    fecha_inicio: date
    fecha_fin: date
    extras: list[ExtraReservaIn] = []
    id_forma_pago: int


class ReservaUpdate(BaseModel):
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    estado: str | None = None
    num_hab: int | None = None


class UsuarioResumen(BaseModel):
    id_usuario: int
    nombre_completo: str
    correo: str

    model_config = {"from_attributes": True}


class HotelResumen(BaseModel):
    id_hotel: int
    nombre: str

    model_config = {"from_attributes": True}


class HabitacionResumen(BaseModel):
    id_hotel: int
    num_hab: int
    tipo: TipoHabResumen | None = None


class ExtraReservaOut(BaseModel):
    id_extra: int
    nombre: str
    precio: Decimal
    cantidad: int


class PagoOut(BaseModel):
    id_pago: int
    fecha: date
    monto: Decimal
    estado: str
    forma_pago: str | None = None


class CalificacionCreate(BaseModel):
    calificacion: int
    comentario: str | None = None


class CalificacionOut(BaseModel):
    id_calificacion: int
    calificacion: int
    comentario: str | None = None

    model_config = {"from_attributes": True}


class StatsAdmin(BaseModel):
    total: int
    pendiente: int
    confirmada: int
    finalizada: int
    cancelada: int
    ingresos_totales: float = 0
    ticket_promedio: float = 0


class UsuarioAdmin(BaseModel):
    id_usuario: int
    nombre_completo: str
    correo: str
    usuario: str
    fecha_registro: date
    num_reservas: int


class ReservaAdminCreate(BaseModel):
    id_usuario: int
    id_hotel: int
    num_hab: int
    fecha_inicio: date
    fecha_fin: date
    extras: list[ExtraReservaIn] = []
    id_forma_pago: int


class ReservaOut(BaseModel):
    id_reserva: int
    fecha_inicio: date
    fecha_fin: date
    total: Decimal
    estado: str
    usuario: UsuarioResumen
    hotel: HotelResumen
    habitacion: HabitacionResumen
    extras: list[ExtraReservaOut] = []
    pago: PagoOut | None = None
    calificacion: CalificacionOut | None = None
