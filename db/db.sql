DROP DATABASE IF EXISTS db_gallinazo;
CREATE DATABASE db_gallinazo;
USE db_gallinazo;

DROP  TABLE IF EXISTS reg_gastos;
CREATE TABLE reg_gastos(
    id_reg_gasto INT AUTO_INCREMENT PRIMARY KEY,
    cant DECIMAL(10,2) DEFAULT 0,
    concepto VARCHAR(100) DEFAULT "",
    costo DECIMAL(10,2) DEFAULT 0.00,

    operacion VARCHAR(100) DEFAULT 'Agregado',
    activo BOOLEAN DEFAULT TRUE,
    origen INT DEFAULT 0,
    fecha DATETIME DEFAULT NOW()
);

DROP PROCEDURE IF EXISTS agregar_reg_gasto;
DELIMITER $
CREATE PROCEDURE agregar_reg_gasto(
    IN p_cant DECIMAL(10,2),
    IN p_concepto VARCHAR(100),
    IN p_costo DECIMAL(10,2)
)
BEGIN
    INSERT INTO reg_gastos(cant, concepto, costo)
    VALUES(p_cant, p_concepto, p_costo);
    SELECT LAST_INSERT_ID() AS last_id_reg_gasto;
END$
DELIMITER ;

DROP PROCEDURE IF EXISTS modificar_reg_gasto;
DELIMITER $
CREATE PROCEDURE modificar_reg_gasto(
    IN p_id_reg_gasto INT,
    IN p_cant DECIMAL(10,2),
    IN p_concepto VARCHAR(100),
    IN p_costo DECIMAL(10,2)
)
BEGIN
    INSERT INTO reg_gastos(cant, concepto, costo, operacion, origen)
        VALUES(p_cant, p_concepto, p_costo, "Modificado", p_id_reg_gasto);
    UPDATE reg_gastos
        SET activo = FALSE
        WHERE id_reg_gasto = p_id_reg_gasto;
    SELECT LAST_INSERT_ID() AS last_id_reg_gasto;
END$
DELIMITER ;

DROP PROCEDURE IF EXISTS eliminar_reg_gasto;
DELIMITER $
CREATE PROCEDURE eliminar_reg_gasto(
    IN p_id_reg_gasto INT
)
BEGIN
    INSERT INTO reg_gastos(operacion, activo, origen)
    VALUES("Eliminado", FALSE, p_id_reg_gasto);
    UPDATE reg_gastos
        SET activo = FALSE
        WHERE id_reg_gasto = p_id_reg_gasto;
    SELECT LAST_INSERT_ID() AS last_id_reg_gasto;
END $
DELIMITER ;

DROP PROCEDURE IF EXISTS listar_gastos;
DELIMITER $
CREATE PROCEDURE listar_gastos(
    IN p_fi VARCHAR(100),
    IN p_ff VARCHAR(100)
)
BEGIN
    SELECT * FROM reg_gastos
    WHERE activo = true AND fecha BETWEEN p_fi AND p_ff
    ORDER BY fecha DESC;
END$
DELIMITER ;

DROP PROCEDURE IF EXISTS listar_gastos_all;
DELIMITER $
CREATE PROCEDURE listar_gastos_all(
    IN p_fi VARCHAR(100),
    IN p_ff VARCHAR(100)
)
BEGIN
    SELECT * FROM reg_gastos
    WHERE fecha BETWEEN p_fi AND p_ff
    ORDER BY fecha DESC;
END$
DELIMITER ;

CREATE TABLE reg_mesas(
    id_reg_mesa INT AUTO_INCREMENT PRIMARY KEY,
    mesa VARCHAR(100),

    operacion VARCHAR(100) DEFAULT 'Agregado',
    activo BOOLEAN DEFAULT TRUE,
    origen INT DEFAULT 0,
    fecha DATETIME DEFAULT NOW()
);
-- Crear el índice compuesto en 'activo' y 'mesa'
CREATE INDEX idx_reg_mesas_activo_mesa ON reg_mesas (activo, mesa);

DELIMITER $
CREATE PROCEDURE agregar_reg_mesa(
    IN p_mesa VARCHAR(100)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reg_mesas WHERE mesa = p_mesa AND activo = TRUE) THEN
        INSERT INTO reg_mesas (mesa)
            VALUES (p_mesa);
    ELSE
        SELECT 'La mesa ya existe. No se puede agregar' AS resultado;
    END IF;
END$
DELIMITER ;
DELIMITER $
CREATE PROCEDURE modificar_reg_mesa(
    IN p_id_reg_mesa INT,
    IN p_mesa VARCHAR(100)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reg_mesas WHERE mesa = p_mesa AND id_reg_mesa <> p_id_reg_mesa AND activo = TRUE) THEN
        INSERT INTO reg_mesas (mesa, operacion, origen)
            VALUES (p_mesa, 'Modificado', p_id_reg_mesa);
        UPDATE reg_mesas
            SET activo = FALSE
            WHERE id_reg_mesa = p_id_reg_mesa;
    ELSE
        SELECT 'La mesa ya existe. No se puede modificar' AS resultado;
    END IF;
END$
DELIMITER ;
DELIMITER $
CREATE PROCEDURE eliminar_reg_mesa(
    IN p_id_reg_mesa INT    
)
BEGIN
    IF EXISTS(SELECT 1 FROM reg_mesas WHERE id_reg_mesa = p_id_reg_mesa AND activo = TRUE) THEN
        INSERT INTO reg_mesas (mesa, operacion, origen)
            VALUES (NULL, 'Eliminado', p_id_reg_mesa);
        UPDATE reg_mesas
            SET activo = FALSE
            WHERE id_reg_mesa = p_id_reg_mesa;
    ELSE
        SELECT 'El id mesa no existe o ya está inactivo. No se puede Eliminar' AS resultado;
    END IF;
END$
DELIMITER ;

-- Registro de clientes

CREATE TABLE reg_clientes(
    id_reg_cliente INT AUTO_INCREMENT PRIMARY KEY,
    cliente VARCHAR(200),
    operacion VARCHAR(100) DEFAULT 'Agregado',
    activo BOOLEAN DEFAULT TRUE,
    origen INT DEFAULT 0,
    fecha DATETIME DEFAULT NOW()
);

-- Crear el índice compuesto en 'activo' y 'cliente'
CREATE INDEX idx_reg_clientes_activo_cliente ON reg_clientes (activo, cliente);

DELIMITER $
CREATE PROCEDURE agregar_reg_cliente(
    IN p_cliente VARCHAR(200)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reg_clientes WHERE cliente = p_cliente AND activo = TRUE) THEN
        INSERT INTO reg_clientes (cliente)
            VALUES (p_cliente);
    ELSE
        SELECT 'El cliente ya existe. No se puede agregar' AS resultado;
    END IF;
END$
DELIMITER ;
DELIMITER $
CREATE PROCEDURE modificar_reg_cliente(
    IN p_id_reg_cliente INT,
    IN p_cliente VARCHAR(200)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reg_clientes WHERE cliente = p_cliente AND id_reg_cliente <> p_id_reg_cliente AND activo = TRUE) THEN
        INSERT INTO reg_clientes (cliente, operacion, origen)
            VALUES (p_cliente, 'Modificado', p_id_reg_cliente);
        UPDATE reg_clientes
            SET activo = FALSE
            WHERE id_reg_cliente = p_id_reg_cliente;
    ELSE
        SELECT 'El cliente ya existe. No se puede modificar' AS resultado;
    END IF;
END$
DELIMITER ;
DELIMITER $
CREATE PROCEDURE eliminar_reg_cliente(
    IN p_id_reg_cliente INT    
)
BEGIN
    IF EXISTS (SELECT 1 FROM reg_clientes WHERE id_reg_cliente = p_id_reg_cliente AND activo = TRUE) THEN
        INSERT INTO reg_clientes (cliente, operacion, origen)
            VALUES (NULL, 'Eliminado', p_id_reg_cliente);
        UPDATE reg_clientes
            SET activo = FALSE
            WHERE id_reg_cliente = p_id_reg_cliente;
    ELSE
        SELECT 'El id cliente no existe o ya está inactivo. No se puede eliminar' AS resultado;
    END IF;
END$
DELIMITER ;

-- Registro de mozos

CREATE TABLE reg_mozos(
    id_reg_mozo INT AUTO_INCREMENT PRIMARY KEY,
    mozo VARCHAR(200),
    operacion VARCHAR(100) DEFAULT 'Agregado',
    activo BOOLEAN DEFAULT TRUE,
    origen INT DEFAULT 0,
    fecha DATETIME DEFAULT NOW()
);

-- Crear el índice compuesto en 'activo' y 'mozo'
CREATE INDEX idx_reg_mozos_activo_mozo ON reg_mozos (activo, mozo);
DELIMITER $
CREATE PROCEDURE agregar_reg_mozo(
    IN p_mozo VARCHAR(200)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reg_mozos WHERE mozo = p_mozo AND activo = TRUE) THEN
        INSERT INTO reg_mozos (mozo)
            VALUES (p_mozo);
    ELSE
        SELECT 'El mozo ya existe. No se puede agregar' AS resultado;
    END IF;
END$
DELIMITER ;
DELIMITER $
CREATE PROCEDURE modificar_reg_mozo(
    IN p_id_reg_mozo INT,
    IN p_mozo VARCHAR(200)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reg_mozos WHERE mozo = p_mozo AND id_reg_mozo <> p_id_reg_mozo AND activo = TRUE) THEN
        INSERT INTO reg_mozos (mozo, operacion, origen)
            VALUES (p_mozo, 'Modificado', p_id_reg_mozo);
        UPDATE reg_mozos
            SET activo = FALSE
            WHERE id_reg_mozo = p_id_reg_mozo;
    ELSE
        SELECT 'El mozo ya existe. No se puede modificar' AS resultado;
    END IF;
END$
DELIMITER ;
DELIMITER $
CREATE PROCEDURE eliminar_reg_mozo(
    IN p_id_reg_mozo INT    
)
BEGIN
    IF EXISTS (SELECT 1 FROM reg_mozos WHERE id_reg_mozo = p_id_reg_mozo AND activo = TRUE) THEN
        INSERT INTO reg_mozos (mozo, operacion, origen)
            VALUES (NULL, 'Eliminado', p_id_reg_mozo);
        UPDATE reg_mozos
            SET activo = FALSE
            WHERE id_reg_mozo = p_id_reg_mozo;
    ELSE
        SELECT 'El id mozo no existe o ya está inactivo. No se puede eliminar' AS resultado;
    END IF;
END$
DELIMITER ;

-- Registro de tipos de pago

CREATE TABLE reg_tipo_pagos(
    id_reg_tipo_pago INT AUTO_INCREMENT PRIMARY KEY,
    tipo_pago VARCHAR(100),
    operacion VARCHAR(100) DEFAULT 'Agregado',
    activo BOOLEAN DEFAULT TRUE,
    origen INT DEFAULT 0,
    fecha DATETIME DEFAULT NOW()
);

-- Crear el índice compuesto en 'activo' y 'tipo_pago'
CREATE INDEX idx_reg_tipo_pagos_activo_tipo_pago ON reg_tipo_pagos (activo, tipo_pago);
DELIMITER $
CREATE PROCEDURE agregar_reg_tipo_pago(
    IN p_tipo_pago VARCHAR(100)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reg_tipo_pagos WHERE tipo_pago = p_tipo_pago AND activo = TRUE) THEN
        INSERT INTO reg_tipo_pagos (tipo_pago)
            VALUES (p_tipo_pago);
    ELSE
        SELECT 'El tipo de pago ya existe. No se puede agregar' AS resultado;
    END IF;
END$
DELIMITER ;
DELIMITER $
CREATE PROCEDURE modificar_reg_tipo_pago(
    IN p_id_reg_tipo_pago INT,
    IN p_tipo_pago VARCHAR(100)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reg_tipo_pagos WHERE tipo_pago = p_tipo_pago AND id_reg_tipo_pago <> p_id_reg_tipo_pago AND activo = TRUE) THEN
        INSERT INTO reg_tipo_pagos (tipo_pago, operacion, origen)
            VALUES (p_tipo_pago, 'Modificado', p_id_reg_tipo_pago);
        UPDATE reg_tipo_pagos
            SET activo = FALSE
            WHERE id_reg_tipo_pago = p_id_reg_tipo_pago;
    ELSE
        SELECT 'El tipo de pago ya existe. No se puede modificar' AS resultado;
    END IF;
END$
DELIMITER ;
DELIMITER $
CREATE PROCEDURE eliminar_reg_tipo_pago(
    IN p_id_reg_tipo_pago INT    
)
BEGIN
    IF EXISTS (SELECT 1 FROM reg_tipo_pagos WHERE id_reg_tipo_pago = p_id_reg_tipo_pago AND activo = TRUE) THEN
        INSERT INTO reg_tipo_pagos (tipo_pago, operacion, origen)
            VALUES (NULL, 'Eliminado', p_id_reg_tipo_pago);
        UPDATE reg_tipo_pagos
            SET activo = FALSE
            WHERE id_reg_tipo_pago = p_id_reg_tipo_pago;
    ELSE
        SELECT 'El id tipo de pago no existe o ya está inactivo. No se puede eliminar' AS resultado;
    END IF;
END$
DELIMITER ;

-- Registro de productos

CREATE TABLE reg_productos(
    id_reg_producto INT AUTO_INCREMENT PRIMARY KEY,
    producto VARCHAR(100),
    costo DECIMAL(10, 2),
    operacion VARCHAR(100) DEFAULT 'Agregado',
    activo BOOLEAN DEFAULT TRUE,
    origen INT DEFAULT 0,
    fecha DATETIME DEFAULT NOW()
);

DROP TABLE IF EXISTS productos;
CREATE TABLE productos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto VARCHAR(100) UNIQUE,
    costo DECIMAL(10,2),
    orden INT
);

DROP TABLE IF EXISTS productos_historial;
CREATE TABLE productos_historial(
    id INT AUTO_INCREMENT PRIMARY KEY,
    operacion VARCHAR(100),
    id_producto INT,
    producto VARCHAR(100),
    costo DECIMAL(10,2),
    orden INT,
    fecha VARCHAR(20)
);

DROP TABLE IF EXISTS clientes;
CREATE TABLE clientes(
    id INT AUTO_INCREMENT PRIMARY KEY,
    dniruc VARCHAR(11) UNIQUE,
    name VARCHAR(100),
    address VARCHAR(200),
    phone VARCHAR(13),
    orden INT
);

DROP TABLE IF EXISTS clientes_historial;
CREATE TABLE clientes_historial(
    id INT AUTO_INCREMENT PRIMARY KEY,
    operacion VARCHAR(100),
    id_cliente INT,
    dniruc VARCHAR(11),
    name VARCHAR(100),
    address VARCHAR(200),
    phone VARCHAR(13),
    orden INT,
    fecha VARCHAR(20)
);

-- Crear el índice compuesto en 'activo' y 'producto'
CREATE INDEX idx_reg_productos_activo_producto ON reg_productos (activo, producto);
DELIMITER $
CREATE PROCEDURE agregar_reg_producto(
    IN p_producto VARCHAR(100),
    IN p_costo DECIMAL(10, 2)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reg_productos WHERE producto = p_producto AND activo = TRUE) THEN
        INSERT INTO reg_productos (producto, costo)
            VALUES (p_producto, p_costo);
    ELSE
        SELECT 'El producto ya existe. No se puede agregar' AS resultado;
    END IF;
END$
DELIMITER ;
DELIMITER $
CREATE PROCEDURE modificar_reg_producto(
    IN p_id_reg_producto INT,
    IN p_producto VARCHAR(100),
    IN p_costo DECIMAL(10, 2)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM reg_productos WHERE producto = p_producto AND id_reg_producto <> p_id_reg_producto AND activo = TRUE) THEN
        INSERT INTO reg_productos (producto, costo, operacion, origen)
            VALUES (p_producto, p_costo, 'Modificado', p_id_reg_producto);
        UPDATE reg_productos
            SET activo = FALSE
            WHERE id_reg_producto = p_id_reg_producto;
    ELSE
        SELECT 'El producto ya existe. No se puede modificar' AS resultado;
    END IF;
END$
DELIMITER ;
DELIMITER $
CREATE PROCEDURE eliminar_reg_producto(
    IN p_id_reg_producto INT    
)
BEGIN
    IF EXISTS (SELECT 1 FROM reg_productos WHERE id_reg_producto = p_id_reg_producto AND activo = TRUE) THEN
        INSERT INTO reg_productos (producto, costo, operacion, origen)
            VALUES (NULL, NULL, 'Eliminado', p_id_reg_producto);
        UPDATE reg_productos
            SET activo = FALSE
            WHERE id_reg_producto = p_id_reg_producto;
    ELSE
        SELECT 'El id producto no existe o ya está inactivo. No se puede eliminar' AS resultado;
    END IF;
END$
DELIMITER ;

-- Registro de datos

CREATE TABLE reg_datos(
    id_reg_dato INT AUTO_INCREMENT PRIMARY KEY,
    mesa VARCHAR(100),
    cliente VARCHAR(200),
    mozo VARCHAR(100),
    total DECIMAL(10,2),
    tipo_pago VARCHAR(100),
    notas_comanda VARCHAR(200) DEFAULT ''
);
CREATE TABLE comandas(
    id_comanda INT AUTO_INCREMENT PRIMARY KEY,
    reg_dato INT,

    fecha DATETIME DEFAULT NOW(),
    operacion VARCHAR(100) DEFAULT 'Agregado',
    activo BOOLEAN DEFAULT TRUE,
    origen INT DEFAULT 0,
    FOREIGN KEY(reg_dato) REFERENCES reg_datos(id_reg_dato)
);
CREATE TABLE reg_items(
    id_reg_item INT AUTO_INCREMENT PRIMARY KEY,
    cant INT DEFAULT 1,
    producto VARCHAR(100),
    costo DECIMAL(10,2),
    notas_producto VARCHAR(200) DEFAULT ''
);
CREATE TABLE items(
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    comanda INT,
    reg_item INT,    
    FOREIGN KEY(comanda) REFERENCES comandas(id_comanda),
    FOREIGN KEY(reg_item) REFERENCES reg_items(id_reg_item)
);

DELIMITER $
CREATE PROCEDURE agregar_reg_dato(
    IN p_mesa VARCHAR(100),
    IN p_cliente VARCHAR(200),
    IN p_mozo VARCHAR(100),
    IN p_total DECIMAL(10, 2),
    IN p_tipo_pago VARCHAR(100),
    IN p_notas_comanda VARCHAR(200),
    OUT p_id_reg_dato INT
)
BEGIN
    -- Agregamos los parámetros a las tablas de registro --
    CALL agregar_reg_mesa(p_mesa);
    CALL agregar_reg_cliente(p_cliente);
    CALL agregar_reg_mozo(p_mozo);
    CALL agregar_reg_tipo_pago(p_tipo_pago);

    INSERT INTO reg_datos(mesa, cliente, mozo, total, tipo_pago, notas_comanda)
        VALUES(p_mesa, p_cliente, p_mozo, p_total, p_tipo_pago, p_notas_comanda);
    SET p_id_reg_dato = LAST_INSERT_ID();
END$
DELIMITER ;

DELIMITER $
CREATE PROCEDURE agregar_comanda(
    IN p_reg_dato INT,
    OUT p_id_comanda INT
)
BEGIN
    INSERT INTO comandas(reg_dato)
        VALUES(p_reg_dato);
    SET p_id_comanda = LAST_INSERT_ID();
END$
DELIMITER ;

DELIMITER $
CREATE PROCEDURE agregar_reg_item(
    IN p_cant INT,
    IN p_producto VARCHAR(100),
    IN p_costo DECIMAL(10, 2),
    IN p_notas_producto VARCHAR(200),
    OUT p_id_reg_item INT
)
BEGIN
    -- Agregamos los parámetros a las tablas de registro --
    CALL agregar_reg_producto(p_producto, p_costo);

    INSERT INTO reg_items(cant, producto, costo, notas_producto)
        VALUES(p_cant, p_producto, p_costo, p_notas_producto);
    SET p_id_reg_item = LAST_INSERT_ID();
END$
DELIMITER ;

DELIMITER $
CREATE PROCEDURE agregar_item(
    IN p_comanda INT,
    IN p_reg_item INT
)
BEGIN    
    INSERT INTO items(comanda, reg_item)
        VALUES(p_comanda, p_reg_item);
END$
DELIMITER ;

DROP PROCEDURE IF EXISTS listar_comandas_activas;
DELIMITER $

CREATE PROCEDURE listar_comandas_activas(
    IN p_fi VARCHAR(100),
    IN p_ff VARCHAR(100)
)
BEGIN
   SELECT c.id_comanda,
        c.fecha,
        c.operacion,
        c.origen,
        c.reg_dato,
        rd.mesa,
        rd.cliente,
        rd.mozo,
        rd.tipo_pago,
        rd.total,
        rd.notas_comanda,
        ri.id_reg_item,
        ri.cant,
        ri.producto, 
        ri.costo, 
        ri.notas_producto
    FROM comandas c
    LEFT JOIN reg_datos rd ON c.reg_dato = rd.id_reg_dato
    LEFT JOIN items i ON c.id_comanda = i.comanda
    LEFT JOIN reg_items ri ON i.reg_item = ri.id_reg_item
    WHERE c.activo = TRUE AND c.fecha BETWEEN p_fi AND p_ff    
    ORDER BY c.fecha DESC;
END$
DELIMITER ;

DROP PROCEDURE IF EXISTS listar_comandas_x_fechas;
DELIMITER $

CREATE PROCEDURE listar_comandas_x_fechas(
    IN p_fi VARCHAR(100),
    IN p_ff VARCHAR(100)
)
BEGIN
  SELECT c.id_comanda,
        c.fecha,
        c.operacion,
        c.origen,
        c.reg_dato,
        rd.mesa,
        rd.cliente,
        rd.mozo,
        rd.tipo_pago,
        rd.total,
        rd.notas_comanda,
        ri.id_reg_item,
        ri.cant,
        ri.producto, 
        ri.costo, 
        ri.notas_producto
    FROM comandas c
    LEFT JOIN reg_datos rd ON c.reg_dato = rd.id_reg_dato
    LEFT JOIN items i ON c.id_comanda = i.comanda
    LEFT JOIN reg_items ri ON i.reg_item = ri.id_reg_item
    WHERE c.fecha BETWEEN p_fi AND p_ff
    ORDER BY c.fecha DESC;
END$
DELIMITER ;

DELIMITER $
CREATE PROCEDURE listar_items(
    IN p_comanda INT
)
BEGIN
    SELECT * FROM items 
        JOIN reg_items ON items.reg_item = reg_items.id_reg_item 
        WHERE items.comanda = p_comanda;
END$
DELIMITER ;

DELIMITER $
CREATE PROCEDURE modificar_comanda(
    IN p_id_reg_dato INT,
    IN p_id_comanda_origen INT,
    OUT p_id_comanda INT
)
BEGIN
    INSERT INTO comandas(reg_dato, operacion, origen)
        VALUES(p_id_reg_dato, 'Modificado', p_id_comanda_origen);
    -- Desactivar comanda anterior
    UPDATE comandas
        SET activo = FALSE
        WHERE id_comanda = p_id_comanda_origen;
    SET p_id_comanda = LAST_INSERT_ID();
END$
DELIMITER ;

DELIMITER $
CREATE PROCEDURE eliminar_comanda(
    IN p_id_comanda_origen INT
)
BEGIN
    INSERT INTO comandas(reg_dato, operacion, activo, origen)
        VALUES(NULL, 'Eliminado', FALSE, p_id_comanda_origen);
    -- Desactivar comanda anterior
    UPDATE comandas 
        SET activo = FALSE
        WHERE id_comanda = p_id_comanda_origen;
END$
DELIMITER ;

-- listar mesas activas
DROP PROCEDURE IF EXISTS listar_mesas;
DELIMITER $
CREATE PROCEDURE listar_mesas()
BEGIN
    SELECT *
    FROM reg_mesas
    WHERE activo = true AND mesa IS NOT NULL;
END$
DELIMITER ;

DELIMITER $
CREATE PROCEDURE listar_clientes()
BEGIN
    SELECT *
    FROM reg_clientes
    WHERE activo = true AND cliente IS NOT NULL;
END$
DELIMITER ;

DELIMITER $
CREATE PROCEDURE listar_mozos()
BEGIN
    SELECT *
    FROM reg_mozos
    WHERE activo = true AND mozo IS NOT NULL;
END$
DELIMITER ;

DELIMITER $
CREATE PROCEDURE listar_tipo_pagos()
BEGIN
    SELECT *
    FROM reg_tipo_pagos
    WHERE activo = true AND tipo_pago IS NOT NULL;
END$
DELIMITER ;

DROP PROCEDURE IF EXISTS listar_productos;
DELIMITER $
CREATE PROCEDURE listar_productos()
BEGIN
    SELECT *
    FROM reg_productos
    WHERE activo = true 
        AND producto IS NOT NULL 
        AND costo IS NOT NULL
    ORDER BY producto ASC;
END$
DELIMITER ;

-- Resúmenes
DROP PROCEDURE IF EXISTS contar_productos_vendidos;
DELIMITER $
CREATE PROCEDURE contar_productos_vendidos(
    IN p_fi DATETIME,
    IN p_ff DATETIME
)
BEGIN
    SELECT    
    ri.producto,
    SUM(ri.cant) AS total_vendido
    FROM
        comandas c
    JOIN
        items i ON c.id_comanda = i.comanda
    JOIN
        reg_items ri ON i.reg_item = ri.id_reg_item
    WHERE
        c.activo =  TRUE
        AND c.fecha BETWEEN p_fi AND p_ff
    GROUP BY
        ri.producto
    ORDER BY
        total_vendido DESC;
END$
DELIMITER ;

DROP PROCEDURE IF EXISTS productos_x_mozo;
DELIMITER $
CREATE PROCEDURE productos_x_mozo(
    IN p_fi DATETIME,
    IN p_ff DATETIME
)
BEGIN
    SELECT * FROM comandas c
    JOIN reg_datos rd ON rd.id_reg_dato = c.reg_dato
    JOIN items i ON c.id_comanda = i.comanda
    JOIN reg_items ri ON i.reg_item = ri.id_reg_item
    WHERE c.activo =  TRUE
        AND c.fecha BETWEEN p_fi AND p_ff    
    ORDER BY rd.mozo ASC;    
END$
DELIMITER ;

-- agregando tabla de impresiones 2025.01.29
DROP TABLE IF EXISTS prints;
CREATE TABLE prints(
    id_print INT AUTO_INCREMENT PRIMARY KEY,
    printingDate DATETIME DEFAULT NOW(),
    destino VARCHAR(200),
    id_comanda INT,
    fecha DATETIME,
    operacion VARCHAR(100),
    origen INT,
    reg_dato INT,
    mesa VARCHAR(100),
    cliente VARCHAR(200),
    mozo VARCHAR(200),
    tipo_pago VARCHAR(100),
    total DECIMAL(10, 2),
    notas_comanda VARCHAR(200)
);

CREATE TABLE items_prints(
    id_item_print INT AUTO_INCREMENT PRIMARY KEY,
    print INT,
    cant INT,
    producto VARCHAR(200),
    costo DECIMAL(10,2),
    notas_producto VARCHAR(200),
    FOREIGN KEY(print) REFERENCES prints(id_print)
);

DROP PROCEDURE if EXISTS AddPrint;
DELIMITER $$
CREATE PROCEDURE AddPrint(
    IN p_destino VARCHAR(200),
    IN p_id_comanda INT, 
    IN p_fecha DATETIME,
    IN p_operacion VARCHAR(100),
    IN p_origen INT,
    IN p_reg_dato INT,
    IN p_mesa VARCHAR(100),
    IN p_cliente VARCHAR(200),
    IN p_mozo VARCHAR(200),
    IN p_tipo_pago VARCHAR(100),
    IN p_total DECIMAL(10, 2),
    IN p_notas_comanda VARCHAR(200),
    IN p_items JSON
)
BEGIN
    DECLARE new_id_print INT;

    -- Insertar en la tabla prints
    INSERT INTO prints (destino, id_comanda, fecha, operacion, origen, reg_dato, mesa, cliente, mozo, tipo_pago, total, notas_comanda)
    VALUES(p_destino, p_id_comanda, p_fecha, p_operacion, p_origen, p_reg_dato, p_mesa, p_cliente, p_mozo, p_tipo_pago, p_total, p_notas_comanda);
    
    -- Obtener el ID del nuevo print
    SET new_id_print = LAST_INSERT_ID();

    -- Insertar los items desde el JSON
    INSERT INTO items_prints (print, cant, producto, costo, notas_producto)
    SELECT new_id_print, 
           JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.cant')) AS cant,
           JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.producto')) AS producto,
           JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.costo')) AS costo,
           JSON_UNQUOTE(JSON_EXTRACT(item.value, '$.notas_producto')) AS notas_producto
    FROM JSON_TABLE(p_items, '$[*]' 
        COLUMNS (
            value JSON PATH '$'
        )
    ) AS item;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS GetPrintsByDateRange;
DELIMITER $$
CREATE PROCEDURE GetPrintsByDateRange(
    IN p_fi DATETIME,
    IN p_ff DATETIME
)
BEGIN
    SELECT * FROM prints
    WHERE printingDate BETWEEN p_fi AND p_ff
    ORDER BY printingDate DESC;
END$$
DELIMITER ;

SET @last_id_reg_dato = NULL;
SET @last_id_comanda = NULL;
SET @last_id_reg_item = NULL;
SET @id_comanda_origen = 1;

-- Agregar comanda
CALL agregar_reg_dato('#3', 'cliente 1', 'mozo 2', 26.00, 'Efectivo', '', @last_id_reg_dato);
CALL agregar_comanda(@last_id_reg_dato, @last_id_comanda);

CALL agregar_reg_item(1, '1/8 Pollo', 10.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, '1/8 Pollo', 10.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, 'Coca Cola 1lt', 6.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);


CALL agregar_reg_dato('#5', 'cliente 2', 'mozo 3', 15.00, 'Yape', '', @last_id_reg_dato);
CALL agregar_comanda(@last_id_reg_dato, @last_id_comanda);

CALL agregar_reg_item(1, '1/8 Pollo', 10.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, 'Chicha Morada 1lt', 5.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);


CALL agregar_reg_dato('#2', 'cliente 3', 'mozo 1', 35.00, 'Plin', '', @last_id_reg_dato);
CALL agregar_comanda(@last_id_reg_dato, @last_id_comanda);

CALL agregar_reg_item(1, '1/8 Pollo', 10.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, '1/8 Pollo', 10.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, '1/8 Pollo', 10.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, 'Coca Cola Personal', 2.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, 'Inca Kola Personal', 2.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, 'Vaso de Limonada', 1.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);



CALL agregar_reg_dato('#1', 'cliente 7', 'mozo 5', 26.00, 'Efectivo', '', @last_id_reg_dato);
CALL agregar_comanda(@last_id_reg_dato, @last_id_comanda);

CALL agregar_reg_item(1, '1/8 Pollo', 10.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, '1/8 Pollo', 10.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, 'Coca Cola 1lt', 6.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);

-- Modificar comanda
CALL agregar_reg_dato('#5', 'cliente juan lopez', 'mozo 3', 30, 'Yape', '15 en efectivo', @last_id_reg_dato);
CALL modificar_comanda(@last_id_reg_dato, 2, @last_id_comanda);

CALL agregar_reg_item(1, '1/8 Pollo', 10.00, 'extra quemadito', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, '1/8 Pollo', 10.00, 'Crocante', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, 'Chicha Morada 1lt', 5.00, '', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);
CALL agregar_reg_item(1, 'Chicha Morada 1lt', 5.00, 'Helada', @last_id_reg_item);
CALL agregar_item(@last_id_comanda, @last_id_reg_item);

-- Eliminar comanda
CALL eliminar_comanda(4);

CALL agregar_reg_producto('1/8 Pollo', 10);
CALL agregar_reg_producto('1/8 Pollo', 10);
CALL agregar_reg_producto('1/8 Pollo', 10);
CALL agregar_reg_producto('1/8 Pollo', 10);

CALL agregar_reg_producto('1/4 Pollo', 18);
CALL agregar_reg_producto('1/4 Pollo', 18);

CALL agregar_reg_producto('1/2 Pollo', 30);
CALL agregar_reg_producto('Pollo Entero', 50);

SELECT * FROM reg_mesas;
SELECT * FROM reg_mozos;
SELECT * FROM reg_clientes;
SELECT * FROM reg_tipo_pagos;
SELECT * FROM reg_productos;