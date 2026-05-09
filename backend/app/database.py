"""Database setup for the Hotel Reservation API.

This module defines the database connection using SQLAlchemy's asynchronous engine,
the base class for declarative models, and a dependency function to provide database
sessions to the API endpoints.

Autor: JulianCelisCreator
Fecha: 2024-06-01
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

# Load variable environment from .env file
load_dotenv()

# Get the database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the asynchronous engine for connecting to the database
if DATABASE_URL is None:
    raise ValueError("DATABASE_URL no está definido en las variables de entorno")
engine = create_async_engine(DATABASE_URL, echo=True)

# Create a session factory for creating asynchronous sessions
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for declarative models."""


async def get_db():
    """Dependency function to provide a database session."""
    async with AsyncSessionLocal() as session:
        yield session
