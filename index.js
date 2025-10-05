const express = require("express");
const { createServer } = require('node:http');
const cors = require("cors");
const os = require("os");
const { Server } = require('socket.io');

const comandasRoutes = require("./routes/comandas");
const mesasRoutes = require("./routes/mesas");
const mozosRoutes = require("./routes/mozos");
const tipos_pagoRoutes = require("./routes/tipos_pago");
const productosRoutes = require("./routes/productos");
const clientesRoutes = require("./routes/clientes");
const resumenRoutes = require("./routes/resumen");
const gastosRoutes = require('./routes/gastos');
const impresionesRoutes = require('./routes/impresiones');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = 4000;

app.use(cors());
app.use(express.json());

// Middleware para pasr io a las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
})

app.use("/api", comandasRoutes);
app.use("/api", mesasRoutes);
app.use("/api", clientesRoutes);
app.use("/api", mozosRoutes);
app.use("/api", tipos_pagoRoutes);
app.use("/api", productosRoutes);
app.use("/api", resumenRoutes);
app.use("/api", gastosRoutes);
app.use('/api', impresionesRoutes)

io.on('connection', socket => {
  console.log(socket.id, 'conectado');

  socket.on('join-clientes', () => {
    socket.join('clientes-room');
    console.log(socket.id, 'en clientes-room');
  });

  socket.on('join-productos', () => {
    socket.join('productos-room');
    console.log(socket.id, 'en productos-room');
  })

  socket.on('disconnect', () => {
    console.log(socket.id, 'desconectado');
  });
});

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

server.listen(port, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
  console.log(`Socket.IO habilitado en el puerto ${port}`);
});
