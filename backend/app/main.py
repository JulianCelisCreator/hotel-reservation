from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine
from app.routers import hotel

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        print("Conexion a la DB exitosa")
    yield
    await engine.dispose()

app = FastAPI(
    title="Hotel Reservation API",
    version="1.0.0",
    description="API para gestión de reservas de hotel",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hotel.router)

@app.get("/api")
def root():
    return {"message": "API funcionando correctamente"}
