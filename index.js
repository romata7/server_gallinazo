const express = require("express");
const cors = require("cors");
const os = require("os");
const http = require('http');
const socketIo = require('socket.io');

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
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = 4000;

app.use(cors());
app.use(express.json());

// Middleware para pasar io a las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api", comandasRoutes);
app.use("/api", mesasRoutes);
app.use("/api", clientesRoutes);
app.use("/api", mozosRoutes);
app.use("/api", tipos_pagoRoutes);
app.use("/api", productosRoutes);
app.use("/api", resumenRoutes);
app.use("/api", gastosRoutes);
app.use('/api', impresionesRoutes)

// Configuración de Socket.IO
io.on('connection', socket => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join-productos', () => {
    socket.join('productos-room');
    console.log(`Cliente ${socket.id} se unió a productos-room`);
  });

  socket.on('join-clientes', () => {
    socket.join('clientes-room');
    console.log(`Cliente ${socket.id} se unió a clientes-room`);
  })

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
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
