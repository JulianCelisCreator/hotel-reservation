"""
File which contains the main application setup for the Hotel Reservation API.
It initializes the FastAPI app, sets up CORS middleware, and includes the hotel
router for handling hotel-related endpoints. The lifespan function ensures that
the database connection is established when the app starts
and properly disposed of when it shuts down.

Autor: JulianCelisCreator
Fecha: 2024-06-01
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.routers import hotel


@asynccontextmanager
async def lifespan(app: FastAPI):
    """_summary_
    Manage life cycle events for the FastAPI application, ensuring that the database connection

    Startup:
        - Verifies the database conection.
        - Prints a message confirming successful connection to the database.
        - Manages the lifespan of the application
    Shutdown:
        - Disposes of the database engine to free up resources.
    """
    async with engine.begin() as conn:
        print("Conexion a la DB exitosa")
    yield
    await engine.dispose()


app = FastAPI(
    title="Hotel Reservation API",
    version="1.0.0",
    description="API para gestión de reservas de hotel",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hotel.router)


@app.get("/api")
def root():
    """Endpoint root for verify that the API is working correctly."""
    return {"message": "API funcionando correctamente"}
