DROP DATABASE IF EXISTS db_gallinazo;
CREATE DATABASE db_gallinazo;
USE db_gallinazo;

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
    fecha DATETIME
);

DROP TABLE IF EXISTS clientes;
CREATE TABLE clientes(
    id INT AUTO_INCREMENT PRIMARY KEY,
    dniruc VARCHAR(11) UNIQUE,
    cliente VARCHAR(100),
    direccion VARCHAR(200),
    telefono VARCHAR(13),
    orden INT
);

DROP TABLE IF EXISTS clientes_historial;
CREATE TABLE clientes_historial(
    id INT AUTO_INCREMENT PRIMARY KEY,
    operacion VARCHAR(100),
    id_cliente INT,
    dniruc VARCHAR(11),
    cliente VARCHAR(100),
    direccion VARCHAR(200),
    telefono VARCHAR(13),
    orden INT,
    fecha DATETIME
);

DROP TABLE IF EXISTS mesas;
CREATE TABLE mesas(
    id INT AUTO_INCREMENT PRIMARY KEY,
    mesa VARCHAR(100),
    orden INT
);

DROP TABLE IF EXISTS mesas_historial;
CREATE TABLE mesas_historial(
    id INT AUTO_INCREMENT PRIMARY KEY,
    operacion VARCHAR(100),
    id_mesa INT,
    mesa VARCHAR(100),
    orden INT,
    fecha DATETIME
);

DROP TABLE IF EXISTS mozos;
CREATE TABLE mozos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(8),
    mozo VARCHAR(100),
    direccion VARCHAR(200),
    telefono VARCHAR(13),
    orden INT
);

DROP TABLE IF EXISTS mozos_historial;
CREATE TABLE mozos_historial(
    id INT AUTO_INCREMENT PRIMARY KEY,
    operacion VARCHAR(100),
    id_mozo INT,
    dni VARCHAR(8),
    mozo VARCHAR(100),
    direccion VARCHAR(200),
    telefono VARCHAR(13),
    orden INT,
    fecha DATETIME
);

DROP TABLE IF EXISTS tipopagos;
CREATE TABLE tipopagos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipopago VARCHAR(100),
    orden INT
);

DROP TABLE IF EXISTS tipopagos_historial;
CREATE TABLE tipopagos_historial(
    id INT AUTO_INCREMENT PRIMARY KEY,
    operacion VARCHAR(100),
    id_tipopago INT,
    tipopago VARCHAR(100),
    orden INT,
    fecha DATETIME
);

DROP TABLE IF EXISTS gastos;
CREATE TABLE gastos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    gasto VARCHAR(100),
    detalles VARCHAR(200),
    costo DECIMAL(10,2),
    orden INT
);

DROP TABLE IF EXISTS gastos_historial;
CREATE TABLE gastos_historial(
    id INT AUTO_INCREMENT PRIMARY KEY,
    operacion VARCHAR(100),
    id_gasto INT,
    gasto VARCHAR(100),
    detalles VARCHAR(200),
    costo DECIMAL(10,2),
    orden INT,
    fecha DATETIME
);