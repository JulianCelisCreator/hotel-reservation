"""SQLAlchemy models for hotel management.

This module defines the database models for the Hotel Reservation API using SQLAlchemy's ORM.
- It includes models for representing hotels, rooms, locations, and their relationships.
- These models are used to interact with the database and perform CRUD operations
Autor: JulianCelisCreator
Fecha: 2024-06-01
"""

from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TipoLugar(Base):
    """Model for representing the type of a location, including its ID and name."""

    __tablename__ = "tipo_lugar"

    id_tipo_lugar = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)


class Lugar(Base):
    """Model for representing a location, including its ID, name, and relationships."""

    __tablename__ = "lugar"

    id_lugar = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    id_tipo_lugar = Column(Integer, ForeignKey("tipo_lugar.id_tipo_lugar"))
    id_lugar_padre = Column(Integer, ForeignKey("lugar.id_lugar"))

    tipo = relationship("TipoLugar")


class Hotel(Base):
    """Model for representing a hotel, including:
    - its ID
    - its name
    - its address
    - its location
    - and relationships."""

    __tablename__ = "hotel"

    id_hotel = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    direccion = Column(String)
    id_lugar = Column(Integer, ForeignKey("lugar.id_lugar"))

    lugar = relationship("Lugar")
    habitaciones = relationship("Habitacion", back_populates="hotel")


class TipoCama(Base):
    """Model for representing the type of a bed, including its ID and name."""

    __tablename__ = "tipo_camas"

    id_tip_cama = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)


class TipoHabitacion(Base):
    """Model for representing the type of a hotel room, including 
    - its ID
    - its name
    - its capacity
    - its price
    - and relationships."""

    __tablename__ = "tipo_habitacion"

    id_tip_hab = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    cant_pers = Column(Integer, nullable=False)
    precio = Column(Numeric, nullable=False)


class Habitacion(Base):
    """Model for representing a hotel room, including its number, type,
    and relationships with the hotel and room type."""

    __tablename__ = "habitacion"

    id_hotel = Column(Integer, ForeignKey("hotel.id_hotel"), primary_key=True)
    num_hab = Column(Integer, primary_key=True)
    id_tipo_hab = Column(Integer, ForeignKey("tipo_habitacion.id_tip_hab"))
    hotel = relationship("Hotel", back_populates="habitaciones")
    tipo = relationship("TipoHabitacion")
