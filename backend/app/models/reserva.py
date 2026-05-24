from sqlalchemy import Column, Date, ForeignKey, ForeignKeyConstraint, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class FormaPago(Base):
    __tablename__ = "forma_pago"

    id_forma_pago = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)


class Extras(Base):
    __tablename__ = "extras"

    id_extra = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    precio = Column(Numeric, nullable=False)


class Reserva(Base):
    __tablename__ = "reserva"

    id_reserva = Column(Integer, primary_key=True)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    total = Column(Numeric, nullable=False)
    estado = Column(String, nullable=False, default="pendiente")
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))

    usuario = relationship("Usuarios")
    habitaciones = relationship(
        "ReservaHabitacion", back_populates="reserva", cascade="all, delete-orphan"
    )
    extras = relationship(
        "ReservaExtra", back_populates="reserva", cascade="all, delete-orphan"
    )
    pago = relationship(
        "Pago", back_populates="reserva", uselist=False, cascade="all, delete-orphan"
    )
    calificacion = relationship(
        "Calificacion", back_populates="reserva", uselist=False, cascade="all, delete-orphan"
    )


class ReservaHabitacion(Base):
    __tablename__ = "reserva_habitacion"
    __table_args__ = (
        ForeignKeyConstraint(
            ["id_hotel", "num_hab"],
            ["habitacion.id_hotel", "habitacion.num_hab"],
        ),
    )

    id_reserva = Column(Integer, ForeignKey("reserva.id_reserva"), primary_key=True)
    id_hotel = Column(Integer, primary_key=True)
    num_hab = Column(Integer, primary_key=True)

    reserva = relationship("Reserva", back_populates="habitaciones")
    habitacion = relationship("Habitacion")


class ReservaExtra(Base):
    __tablename__ = "reserva_extra"

    id_reserva = Column(Integer, ForeignKey("reserva.id_reserva"), primary_key=True)
    id_extra = Column(Integer, ForeignKey("extras.id_extra"), primary_key=True)
    cantidad = Column(Integer, nullable=False, default=1)

    reserva = relationship("Reserva", back_populates="extras")
    extra = relationship("Extras")


class Pago(Base):
    __tablename__ = "pago"

    id_pago = Column(Integer, primary_key=True)
    fecha = Column(Date, nullable=False)
    monto = Column(Numeric, nullable=False)
    estado = Column(String, nullable=False, default="pendiente")
    id_reserva = Column(Integer, ForeignKey("reserva.id_reserva"))
    id_forma_pago = Column(Integer, ForeignKey("forma_pago.id_forma_pago"))

    reserva = relationship("Reserva", back_populates="pago")
    forma_pago = relationship("FormaPago")


class Calificacion(Base):
    __tablename__ = "calificaciones"

    id_calificacion = Column(Integer, primary_key=True)
    calificacion = Column(Integer, nullable=False)
    comentario = Column(String)
    id_reserva = Column(Integer, ForeignKey("reserva.id_reserva"), unique=True)

    reserva = relationship("Reserva", back_populates="calificacion")
