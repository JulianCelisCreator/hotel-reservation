from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TipoLugar(Base):
    __tablename__ = "tipo_lugar"

    id_tipo_lugar = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)


class Lugar(Base):
    __tablename__ = "lugar"

    id_lugar = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    id_tipo_lugar = Column(Integer, ForeignKey("tipo_lugar.id_tipo_lugar"))
    id_lugar_padre = Column(Integer, ForeignKey("lugar.id_lugar"))

    tipo = relationship("TipoLugar")


class Hotel(Base):
    __tablename__ = "hotel"

    id_hotel = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    direccion = Column(String)
    id_lugar = Column(Integer, ForeignKey("lugar.id_lugar"))

    lugar = relationship("Lugar")
    habitaciones = relationship("Habitacion", back_populates="hotel")


class TipoCama(Base):
    __tablename__ = "tipo_camas"

    id_tip_cama = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)


class TipoHabitacion(Base):
    __tablename__ = "tipo_habitacion"

    id_tip_hab = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    cant_pers = Column(Integer, nullable=False)
    precio = Column(Numeric, nullable=False)


class Habitacion(Base):
    __tablename__ = "habitacion"

    id_hotel = Column(Integer, ForeignKey("hotel.id_hotel"), primary_key=True)
    num_hab = Column(Integer, primary_key=True)
    id_tipo_hab = Column(Integer, ForeignKey("tipo_habitacion.id_tip_hab"))

    hotel = relationship("Hotel", back_populates="habitaciones")
    tipo = relationship("TipoHabitacion")
