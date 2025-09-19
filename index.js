const express = require("express");
const cors = require("cors");
const os = require("os");
const comandasRoutes = require("./routes/comandas");
const mesasRoutes = require("./routes/mesas");
const clientesRoutes = require("./routes/clientes");
const mozosRoutes = require("./routes/mozos");
const tipos_pagoRoutes = require("./routes/tipos_pago");
const productosRoutes = require("./routes/productos");
const resumenRoutes = require("./routes/resumen");
const gastosRoutes = require('./routes/gastos');
const impresionesRoutes = require('./routes/impresiones');

const app = express();
const port = 4000;

app.use(cors());

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

app.use("/api", comandasRoutes);
app.use("/api", mesasRoutes);
app.use("/api", clientesRoutes);
app.use("/api", mozosRoutes);
app.use("/api", tipos_pagoRoutes);
app.use("/api", productosRoutes);
app.use("/api", resumenRoutes);
app.use("/api", gastosRoutes);
app.use('/api', impresionesRoutes)
// Endpoint para obtener la IP
app.get("/api/get-ip", (req, res) => {
  const interfaces = os.networkInterfaces();
  let localIP = "";

  for (const interface in interfaces) {
    for (const alias of interfaces[interface]) {
      if (alias.family === "IPv4" && !alias.internal) {
        localIP = alias.address;
        break;
      }
    }
    if (localIP) break; // Si ya encontramos la IP, salimos
  }
  res.json({ ip: localIP });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
});
