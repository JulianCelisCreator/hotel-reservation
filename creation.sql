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
  id_reserva INT NOT NULL REFERENCES reserva(id_reserva) ON DELETE CASCADE,
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
  id_reserva INT REFERENCES reserva(id_reserva) ON DELETE CASCADE NOT NULL,
  id_forma_pago INT REFERENCES forma_pago(id_forma_pago) NOT NULL
);

CREATE TABLE extras (
  id_extra SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio NUMERIC CHECK (precio >= 0)
);

CREATE TABLE reserva_extra (
  id_reserva INT REFERENCES reserva(id_reserva) ON DELETE CASCADE,
  id_extra INT REFERENCES extras(id_extra),
  cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  PRIMARY KEY (id_reserva, id_extra)
);

CREATE TABLE calificaciones (
  id_calificacion SERIAL PRIMARY KEY,
  calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  id_reserva INT UNIQUE REFERENCES reserva(id_reserva) ON DELETE CASCADE
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


-- =========================
-- VISTAS (VIEWS)
-- =========================
-- Las siguientes vistas exponen consultas frecuentes precompuestas para
-- el panel de administración. Se consumen desde la API en
-- backend/app/services/admin_service.py.


-- -------------------------------------------------------------------------
-- vista_reservas_completa
-- -------------------------------------------------------------------------
-- Une todas las relaciones de una reserva (cliente, hotel, ciudad,
-- habitación, tipo de habitación, pago, forma de pago y calificación)
-- en una sola fila plana. Evita repetir 7+ JOINs en la aplicación
-- cuando el admin necesita un listado o un reporte ad-hoc.
--
-- Ejemplo de uso ad-hoc:
--   SELECT id_reserva, cliente_nombre, hotel_nombre, estado_reserva, total
--   FROM vista_reservas_completa
--   WHERE estado_reserva = 'finalizada'
--   ORDER BY fecha_inicio DESC;
--
-- Consumida en: admin_service.listar_reservas_reporte()
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW vista_reservas_completa AS
SELECT
    r.id_reserva,
    r.fecha_inicio,
    r.fecha_fin,
    (r.fecha_fin - r.fecha_inicio)            AS noches,
    r.total,
    r.estado                                  AS estado_reserva,
    u.id_usuario,
    u.nombre_completo                         AS cliente_nombre,
    u.correo                                  AS cliente_correo,
    u.usuario                                 AS cliente_usuario,
    h.id_hotel,
    h.nombre                                  AS hotel_nombre,
    h.direccion                               AS hotel_direccion,
    lugar_ciudad.nombre                       AS hotel_ciudad,
    rh.num_hab,
    th.id_tip_hab,
    th.nombre                                 AS tipo_habitacion,
    th.cant_pers                              AS habitacion_capacidad,
    th.precio                                 AS precio_noche,
    p.id_pago,
    p.fecha                                   AS pago_fecha,
    p.monto                                   AS pago_monto,
    p.estado                                  AS estado_pago,
    fp.nombre                                 AS forma_pago,
    c.calificacion,
    c.comentario
FROM reserva r
JOIN usuarios u             ON u.id_usuario      = r.id_usuario
JOIN reserva_habitacion rh  ON rh.id_reserva     = r.id_reserva
JOIN hotel h                ON h.id_hotel        = rh.id_hotel
LEFT JOIN lugar lugar_ciudad ON lugar_ciudad.id_lugar = h.id_lugar
JOIN habitacion hab         ON hab.id_hotel      = rh.id_hotel
                            AND hab.num_hab      = rh.num_hab
JOIN tipo_habitacion th     ON th.id_tip_hab     = hab.id_tipo_hab
LEFT JOIN pago p            ON p.id_reserva      = r.id_reserva
LEFT JOIN forma_pago fp     ON fp.id_forma_pago  = p.id_forma_pago
LEFT JOIN calificaciones c  ON c.id_reserva      = r.id_reserva;


-- -------------------------------------------------------------------------
-- vista_stats_admin
-- -------------------------------------------------------------------------
-- Métricas agregadas para el dashboard del administrador. Calcula
-- conteos por estado, ingresos totales (excluyendo canceladas) y
-- ticket promedio en una sola consulta.
--
-- Ejemplo de uso ad-hoc:
--   SELECT * FROM vista_stats_admin;
--
-- Consumida en: admin_service.obtener_stats() → GET /api/admin/stats
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW vista_stats_admin AS
SELECT
    COUNT(*)                                                       AS total,
    COUNT(*) FILTER (WHERE estado = 'pendiente')                   AS pendiente,
    COUNT(*) FILTER (WHERE estado = 'confirmada')                  AS confirmada,
    COUNT(*) FILTER (WHERE estado = 'finalizada')                  AS finalizada,
    COUNT(*) FILTER (WHERE estado = 'cancelada')                   AS cancelada,
    COALESCE(SUM(total) FILTER (WHERE estado <> 'cancelada'), 0)   AS ingresos_totales,
    COALESCE(AVG(total) FILTER (WHERE estado <> 'cancelada'), 0)   AS ticket_promedio
FROM reserva;


-- =========================
-- ÍNDICES
-- =========================
-- Las llaves primarias y UNIQUE ya crean índices implícitos. Los siguientes
-- son índices adicionales sobre columnas que la API consulta con frecuencia
-- y que NO están cubiertas por PK/UNIQUE.


-- -------------------------------------------------------------------------
-- idx_reserva_estado
-- -------------------------------------------------------------------------
-- Justificación: el dashboard admin (GET /api/admin/stats → vista_stats_admin)
-- agrupa por `estado` y el listado (GET /api/admin/reservas?estado=...)
-- filtra por este campo. Sin el índice, Postgres haría un seq scan completo
-- de la tabla reserva cada vez.
-- -------------------------------------------------------------------------
CREATE INDEX idx_reserva_estado ON reserva(estado);


-- -------------------------------------------------------------------------
-- idx_reserva_fechas
-- -------------------------------------------------------------------------
-- Justificación: la consulta de disponibilidad
-- (reserva_repository.habitaciones_disponibles) filtra por solapamiento de
-- rango: `fecha_inicio < :fin AND fecha_fin > :inicio`. El índice compuesto
-- en (fecha_inicio, fecha_fin) acelera ese tipo de query en órdenes de
-- magnitud cuando la tabla crece.
-- -------------------------------------------------------------------------
CREATE INDEX idx_reserva_fechas ON reserva(fecha_inicio, fecha_fin);


-- =========================
-- PROCEDIMIENTOS / FUNCIONES DE NEGOCIO
-- =========================


-- -------------------------------------------------------------------------
-- fn_calcular_total_reserva
-- -------------------------------------------------------------------------
-- Calcula el total real de una reserva sumando:
--   precio_noche × noches + Σ (extra.precio × cantidad)
--
-- Encapsula la lógica de negocio en la DB. Útil para:
--   1. Recalcular total tras editar fechas/extras.
--   2. Verificar consistencia entre el monto del pago y la reserva.
--   3. Reportes (SELECT fn_calcular_total_reserva(id_reserva) AS recalculado
--      FROM reserva).
--
-- Consumida en: GET /api/admin/reservas/{id}/recalcular-total
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calcular_total_reserva(p_id_reserva INT)
RETURNS NUMERIC AS $$
DECLARE
    v_noches       INT;
    v_precio_noche NUMERIC;
    v_total_extras NUMERIC;
BEGIN
    -- Validar existencia y obtener número de noches
    SELECT (fecha_fin - fecha_inicio) INTO v_noches
    FROM reserva
    WHERE id_reserva = p_id_reserva;

    IF v_noches IS NULL THEN
        RAISE EXCEPTION 'Reserva % no existe', p_id_reserva;
    END IF;

    -- Precio por noche del tipo de habitación asociado
    SELECT th.precio INTO v_precio_noche
    FROM reserva_habitacion rh
    JOIN habitacion h
      ON h.id_hotel = rh.id_hotel AND h.num_hab = rh.num_hab
    JOIN tipo_habitacion th
      ON th.id_tip_hab = h.id_tipo_hab
    WHERE rh.id_reserva = p_id_reserva
    LIMIT 1;

    IF v_precio_noche IS NULL THEN
        RAISE EXCEPTION 'Reserva % no tiene habitación asignada', p_id_reserva;
    END IF;

    -- Suma de extras
    SELECT COALESCE(SUM(e.precio * re.cantidad), 0) INTO v_total_extras
    FROM reserva_extra re
    JOIN extras e ON e.id_extra = re.id_extra
    WHERE re.id_reserva = p_id_reserva;

    RETURN (v_precio_noche * v_noches) + v_total_extras;
END;
$$ LANGUAGE plpgsql;
