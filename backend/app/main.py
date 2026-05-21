"""
File which contains the main application setup for the Hotel Reservation API.
It initializes the FastAPI app, sets up CORS middleware, and includes the hotel
router for handling hotel-related endpoints. The lifespan function ensures that
the database connection is established when the app starts
and properly disposed of when it shuts down.

Autor: JulianCelisCreator
Fecha: 2024-06-01
"""

import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import AsyncSessionLocal, engine
from app.routers import admin, auth, catalogo, hotel, reserva
from app.utils.seed import seed_initial_data


async def _wait_for_db(max_attempts: int = 20, delay: float = 1.5) -> None:
    """Espera a que la DB resuelva por DNS y acepte conexiones.

    Resuelve la condición de carrera con `depends_on: service_healthy` en Docker:
    incluso si el contenedor `db` está healthy, el DNS embebido a veces
    tarda en propagar el hostname al contenedor del backend.
    """
    last_exc: Exception | None = None
    for attempt in range(1, max_attempts + 1):
        try:
            async with engine.begin() as conn:
                del conn
            print(f"Conexion a la DB exitosa (intento {attempt})")
            return
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            print(f"DB no lista (intento {attempt}/{max_attempts}): {exc.__class__.__name__}")
            await asyncio.sleep(delay)
    raise RuntimeError(f"No se pudo conectar a la DB tras {max_attempts} intentos") from last_exc


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _wait_for_db()

    async with AsyncSessionLocal() as db:
        await seed_initial_data(db)

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
app.include_router(auth.router)
app.include_router(reserva.router)
app.include_router(admin.router)
app.include_router(catalogo.router)


@app.get("/api")
def root():
    """Endpoint root for verify that the API is working correctly."""
    return {"message": "API funcionando correctamente"}
