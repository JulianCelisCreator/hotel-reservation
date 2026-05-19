-- =========================
-- DATABASE
-- =========================

-- DROP DATABASE IF EXISTS project_hotel;
-- CREATE DATABASE project_hotel;

-- =========================
-- TABLAS
-- =========================

CREATE TABLE tipo_usuario (
  id_tipo_usuario SERIAL PRIMARY KEY,
  rol TEXT NOT NULL
);

CREATE TABLE permisos (
  id_permiso SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE tipo_contacto (
  id_tipo_contacto SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE forma_pago (
  id_forma_pago SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE tipo_lugar (
  id_tipo_lugar SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  usuario TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  fecha_nacimiento DATE,
  fecha_registro DATE DEFAULT CURRENT_DATE,
  id_tipo_usuario INT REFERENCES tipo_usuario(id_tipo_usuario)
);

CREATE TABLE tipo_usuario_permiso (
  id_tipo_usuario INT REFERENCES tipo_usuario(id_tipo_usuario),
  id_permiso INT REFERENCES permisos(id_permiso),
  PRIMARY KEY (id_tipo_usuario, id_permiso)
);

CREATE TABLE contacto (
  id_contacto SERIAL PRIMARY KEY,
  valor TEXT NOT NULL,
  id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
  id_tipo_contacto INT NOT NULL REFERENCES tipo_contacto(id_tipo_contacto)
);

CREATE TABLE lugar (
  id_lugar SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  id_tipo_lugar INT REFERENCES tipo_lugar(id_tipo_lugar),
  id_lugar_padre INT REFERENCES lugar(id_lugar),
  CHECK (id_lugar <> id_lugar_padre)
);

CREATE TABLE hotel (
  id_hotel SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT,
  id_lugar INT REFERENCES lugar(id_lugar)
);

CREATE TABLE tipo_camas (
  id_tip_cama SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL
);


CREATE TABLE tipo_habitacion (
  id_tip_hab SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  cant_pers INT NOT NULL CHECK (cant_pers > 0),
  precio NUMERIC NOT NULL CHECK (precio >= 0)
);


CREATE TABLE habitacion (
  id_hotel INT NOT NULL REFERENCES hotel(id_hotel),
  num_hab INT NOT NULL,
  id_tipo_hab INT REFERENCES tipo_habitacion(id_tip_hab),
  PRIMARY KEY (id_hotel, num_hab)
);



CREATE TABLE tipo_habitacion_cama (
  id_tip_hab INT NOT NULL,
  id_tip_cama INT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY (id_tip_hab, id_tip_cama),
  FOREIGN KEY (id_tip_hab) REFERENCES tipo_habitacion(id_tip_hab),
  FOREIGN KEY (id_tip_cama) REFERENCES tipo_camas(id_tip_cama)
);


CREATE TABLE reserva (
  id_reserva SERIAL PRIMARY KEY,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  total NUMERIC CHECK (total >= 0),
  estado VARCHAR(20) CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'finalizada')),
  id_usuario INT NOT NULL REFERENCES usuarios(id_usuario),
  CONSTRAINT chk_fechas CHECK (fecha_fin > fecha_inicio)
);

CREATE TABLE reserva_habitacion (
  id_reserva INT NOT NULL REFERENCES reserva(id_reserva),
  id_hotel INT NOT NULL,
  num_hab INT NOT NULL,
  PRIMARY KEY (id_reserva, id_hotel, num_hab),
  FOREIGN KEY (id_hotel, num_hab)
    REFERENCES habitacion(id_hotel, num_hab)
);

CREATE TABLE pago (
  id_pago SERIAL PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  monto NUMERIC NOT NULL CHECK (monto >= 0),
  estado VARCHAR(20) CHECK (estado IN ('pendiente', 'pagado', 'fallido')),
  id_reserva INT REFERENCES reserva(id_reserva) NOT NULL,
  id_forma_pago INT REFERENCES forma_pago(id_forma_pago) NOT NULL
);

CREATE TABLE extras (
  id_extra SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio NUMERIC CHECK (precio >= 0)
);

CREATE TABLE reserva_extra (
  id_reserva INT REFERENCES reserva(id_reserva),
  id_extra INT REFERENCES extras(id_extra),
  cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  PRIMARY KEY (id_reserva, id_extra)
);

CREATE TABLE calificaciones (
  id_calificacion SERIAL PRIMARY KEY,
  calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  id_reserva INT UNIQUE REFERENCES reserva(id_reserva)
);


-----------------------------------------------------------
--			1. TRIGGER
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_validar_lugar()
RETURNS TRIGGER AS $$
DECLARE
  tipo_padre INT;
BEGIN
  -- Evitar que sea su propio padre (doble seguridad)
  IF NEW.id_lugar = NEW.id_lugar_padre THEN
    RAISE EXCEPTION 'Un lugar no puede ser su propio padre';
  END IF;

  -- Si no tiene padre, es raíz (ej: país)
  IF NEW.id_lugar_padre IS NULL THEN
    RETURN NEW;
  END IF;

  -- Verificar que el padre exista y obtener su tipo
  SELECT id_tipo_lugar INTO tipo_padre
  FROM lugar
  WHERE id_lugar = NEW.id_lugar_padre;

  IF tipo_padre IS NULL THEN
    RAISE EXCEPTION 'El lugar padre no existe';
  END IF;

  -- Validar jerarquía (ej: País < Departamento < Ciudad)
  IF NEW.id_tipo_lugar <= tipo_padre THEN
    RAISE EXCEPTION 'Jerarquía inválida: el hijo debe ser de nivel inferior al padre';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_lugar
BEFORE INSERT OR UPDATE ON lugar
FOR EACH ROW
EXECUTE FUNCTION fn_validar_lugar();



-----------------------------------------------------------
--			2. TRIGGER
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_validar_fecha_reserva()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fecha_inicio < CURRENT_DATE THEN
    RAISE EXCEPTION 'No se pueden hacer reservas en fechas pasadas';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_validar_fecha_reserva
BEFORE INSERT ON reserva
FOR EACH ROW
EXECUTE FUNCTION fn_validar_fecha_reserva();