from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import generate_salt, hash_password
from app.models.usuario import TipoUsuario, Usuarios


ADMIN_DATA = {
    "nombre_completo": "Administrador",
    "correo": "admin@hotel.com",
    "usuario": "admin",
    "password": "Admin123*",
    "fecha_nacimiento": date(1990, 1, 1),
}


async def seed_initial_data(db: AsyncSession) -> None:
    await _seed_admin(db)


async def _seed_admin(db: AsyncSession) -> None:
    result = await db.execute(select(Usuarios).where(Usuarios.correo == ADMIN_DATA["correo"]))
    if result.scalar_one_or_none() is not None:
        return

    result = await db.execute(select(TipoUsuario).where(TipoUsuario.rol == "administrador"))
    tipo_admin = result.scalar_one_or_none()
    if tipo_admin is None:
        return

    salt = generate_salt()
    admin = Usuarios(
        nombre_completo=ADMIN_DATA["nombre_completo"],
        correo=ADMIN_DATA["correo"],
        usuario=ADMIN_DATA["usuario"],
        password_hash=hash_password(ADMIN_DATA["password"], salt),
        salt=salt,
        fecha_nacimiento=ADMIN_DATA["fecha_nacimiento"],
        id_tipo_usuario=tipo_admin.id_tipo_usuario,
    )
    db.add(admin)
    await db.commit()
    print("Admin creado: admin@hotel.com / Admin123*")
