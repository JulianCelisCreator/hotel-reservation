"""This module defines the Usuario model and related models for user management.

Author: JulianCelisCreator
Date: 2024-06-01

"""

from datetime import date
from sqlalchemy import ForeignKey, Column, Integer, String, Date
from sqlalchemy.orm import relationship
from app.database import Base


class Usuarios(Base):
    """Model for representing a user in the system, including:
    - id_usuario: Unique identifier for the user.
    - nombre_completo: Full name of the user.
    - correo: Email address of the user, which must be unique.
    - usuario: Username for the user, which must be unique.
    - password: Plain text password (not recommended for production).
    - password_hash: Hashed version of the password for secure storage.
    - salt: Unique salt used for hashing the password."""

    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True)
    nombre_completo = Column(String, nullable=False)
    correo = Column(String, unique=True, nullable=False)
    usuario = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    salt = Column(String, nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    fecha_registro = Column(Date, default=date.today)

    id_tipo_usuario = Column(Integer, ForeignKey("tipo_usuario.id_tipo_usuario"))
    tipo_usuario = relationship("TipoUsuario", back_populates="usuarios")


class TipoUsuario(Base):
    """_summary_
        This is a class that represents the type of user in the system, including:
    - id_tipo_usuario: Unique identifier for the user type.
    - rol: Role of the user (e.g., admin, customer, etc.).
        Args:
            Base (_type_): _description_
    """

    __tablename__ = "tipo_usuario"
    id_tipo_usuario = Column(Integer, primary_key=True)
    rol = Column(String, nullable=False)

    usuarios = relationship("Usuarios", back_populates="tipo_usuario")


class TipoUsuarioPermiso(Base):
    """Model for representing the permissions associated with a user type, including:
    - id_tipo_usuario_permiso: Unique identifier for the user type permission.
    - id_tipo_usuario: Foreign key linking to the TipoUsuario model.
    - id_permiso: Foreign key linking to the Permisos model.
    - permiso: Description of the permission granted to the user type.
        Args:        Base (_type_): _description_
    """

    __tablename__ = "tipo_usuario_permiso"
    id_tipo_usuario = Column(Integer, ForeignKey("tipo_usuario.id_tipo_usuario"), primary_key=True)
    id_permiso      = Column(Integer, ForeignKey("permisos.id_permiso"),          primary_key=True)

class Permisos(Base):
    """Model for representing a permission in the system, including:
    - id_permiso: Unique identifier for the permission.
    - nombre: Name of the permission (e.g., "create_user", "delete_user", etc.).
        Args:        Base (_type_): _description_
    """

    __tablename__ = "permisos"
    id_permiso = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)

