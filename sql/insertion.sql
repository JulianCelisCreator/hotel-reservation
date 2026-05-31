-- =========================
-- SEED DATA
-- =========================

-- User types
INSERT INTO tipo_usuario (rol) VALUES
  ('cliente'),
  ('administrador'),
  ('recepcionista');

-- Permissions
INSERT INTO permisos (nombre) VALUES
  ('ver_reservas'),
  ('gestionar_reservas'),
  ('gestionar_usuarios'),
  ('gestionar_hoteles');

-- Permissions per user type
INSERT INTO tipo_usuario_permiso (id_tipo_usuario, id_permiso) VALUES
  (1, 1),
  (2, 1), (2, 2), (2, 3), (2, 4),
  (3, 1), (3, 2);

-- Contact types
INSERT INTO tipo_contacto (nombre) VALUES
  ('Teléfono'),
  ('Correo electrónico'),
  ('WhatsApp');

-- Payment methods
INSERT INTO forma_pago (nombre) VALUES
  ('Tarjeta de crédito'),
  ('Tarjeta débito'),
  ('Transferencia bancaria'),
  ('Efectivo');

-- Place types (hierarchy: higher id = lower level)
INSERT INTO tipo_lugar (nombre) VALUES
  ('País'),        -- id 1
  ('Departamento'),-- id 2
  ('Ciudad'),      -- id 3
  ('Barrio');      -- id 4

-- Places: Country > Departments > Cities > Neighborhoods
INSERT INTO lugar (nombre, id_tipo_lugar, id_lugar_padre) VALUES
  ('Colombia',           1, NULL), -- id 1
  ('Cundinamarca',       2, 1),    -- id 2
  ('Antioquia',          2, 1),    -- id 3
  ('Valle del Cauca',    2, 1),    -- id 4
  ('Bolívar',            2, 1),    -- id 5
  ('Santander',          2, 1),    -- id 6
  ('Bogotá D.C.',        3, 2),    -- id 7
  ('Medellín',           3, 3),    -- id 8
  ('Cali',               3, 4),    -- id 9
  ('Cartagena de Indias',3, 5),    -- id 10
  ('Bucaramanga',        3, 6),    -- id 11
  ('La Candelaria',      4, 7),    -- id 12 (Bogotá neighborhood)
  ('El Poblado',         4, 8),    -- id 13 (Medellín neighborhood)
  ('San Fernando',       4, 9),    -- id 14 (Cali neighborhood)
  ('Centro Histórico',   4, 10),   -- id 15 (Cartagena neighborhood)
  ('Cabecera del Llano', 4, 11);   -- id 16 (Bucaramanga neighborhood)

-- 5 Customers
INSERT INTO usuarios (nombre_completo, correo, usuario, password_hash, salt, fecha_nacimiento, id_tipo_usuario) VALUES
  ('Carlos Andrés Gómez Vargas',  'carlos.gomez@gmail.com',   'cgomez',      'a3f8d2c1e4b7f9a0d5e6c2b8f3a1d4e7', 'b1c2d3e4f5a6b7c8', '1990-03-15', 1),
  ('María Fernanda López Ríos',   'mflopez@gmail.com',        'mflopez',     'c7e2a9f4b1d6e8c3a0f5b2d9e7c4a1f8', 'd4e5f6a7b8c9d0e1', '1985-07-22', 1),
  ('Juan Pablo Rodríguez Suárez', 'jprodriguez@gmail.com',    'jprodriguez', 'e1b4c7f2a9d5e8b3c0f6a2d8e5c1b9f4', 'f7a8b9c0d1e2f3a4', '1993-11-08', 1),
  ('Ana Lucía Martínez Herrera',  'anamartinez@gmail.com',    'amartinez',   'f9d3a6c2e8b5f1d4a7c0e3b6f2d9a5c8', 'a2b3c4d5e6f7a8b9', '1988-04-30', 1),
  ('Diego Alejandro Torres Cano', 'dtorres@gmail.com',        'dtorres',     'b5e8a2d6f3c9b1e4a7d0f5c2e9b6a3d8', 'c5d6e7f8a9b0c1d2', '1995-09-17', 1);

-- Customer contacts (phone and WhatsApp)
INSERT INTO contacto (valor, id_usuario, id_tipo_contacto) VALUES
  ('3101234567', 1, 1), ('3101234567', 1, 3),
  ('3207654321', 2, 1), ('3207654321', 2, 3),
  ('3154449988', 3, 1), ('3154449988', 3, 3),
  ('3003337755', 4, 1), ('3003337755', 4, 3),
  ('3168882211', 5, 1), ('3168882211', 5, 3);

-- 5 Hotels across Colombia (id_lugar points to neighborhood)
INSERT INTO hotel (nombre, direccion, id_lugar) VALUES
  ('Hotel Tequendama',        'Carrera 10 # 26-21', 12),  -- La Candelaria, Bogotá
  ('Hotel Dann Carlton',      'Calle 1 Sur # 43A-83', 13), -- El Poblado, Medellín
  ('Hotel Intercontinental',  'Avenida Colombia # 2-72', 14), -- San Fernando, Cali
  ('Hotel Santa Clara',       'Calle del Torno # 39-29', 15), -- Centro Histórico, Cartagena
  ('Hotel Chicamocha',        'Calle 34 # 31-24', 16);    -- Cabecera del Llano, Bucaramanga

-- Bed types
INSERT INTO tipo_camas (nombre) VALUES
  ('Sencilla'),
  ('Doble'),
  ('Queen'),
  ('King');

-- Room types
INSERT INTO tipo_habitacion (nombre, cant_pers, precio) VALUES
  ('Estándar Sencilla',  1, 150000),
  ('Estándar Doble',     2, 250000),
  ('Suite Junior',       2, 400000),
  ('Suite Presidencial', 4, 800000);

-- Beds per room type
INSERT INTO tipo_habitacion_cama (id_tip_hab, id_tip_cama, cantidad) VALUES
  (1, 1, 1),  -- Standard Single: 1 single bed
  (2, 2, 1),  -- Standard Double: 1 double bed
  (3, 3, 1),  -- Junior Suite: 1 queen bed
  (4, 4, 1),  -- Presidential Suite: 1 king bed
  (4, 2, 2);  -- Presidential Suite: + 2 double beds

-- Rooms per hotel (3 rooms each)
INSERT INTO habitacion (id_hotel, num_hab, id_tipo_hab) VALUES
  (1, 101, 1), (1, 102, 2), (1, 103, 3),
  (2, 201, 2), (2, 202, 3), (2, 203, 4),
  (3, 301, 1), (3, 302, 2), (3, 303, 3),
  (4, 401, 2), (4, 402, 3), (4, 403, 4),
  (5, 501, 1), (5, 502, 2), (5, 503, 3);

-- Extras
INSERT INTO extras (nombre, precio) VALUES
  ('Desayuno incluido',       35000),
  ('Servicio a la habitación',25000),
  ('Parqueadero',             20000),
  ('Spa y jacuzzi',           80000),
  ('Tour por la ciudad',      60000);

