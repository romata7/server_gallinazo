const express = require("express");
const { createServer } = require('node:http');
const cors = require("cors");
const os = require("os");
const { Server } = require('socket.io');
require('dotenv').config();

const comandasRoutes = require("./routes/comandas");
const resumenRoutes = require("./routes/resumen");
// const impresionesRoutes = require('./routes/impresiones');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT;

app.use(cors());
app.use(express.json());

// Middleware para pasr io a las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
})

app.use("/api", require('./routes/clientes'));
app.use("/api", require('./routes/productos'));
app.use("/api", require('./routes/mesas'));
app.use("/api", require('./routes/mozos'));
app.use("/api", require('./routes/tipopagos'));
app.use("/api", require('./routes/gastos'));
app.use("/api", comandasRoutes);
app.use("/api", resumenRoutes);
// app.use('/api', impresionesRoutes)

io.on('connection', socket => {
  console.log(socket.id, 'conectado');

  socket.on('join-clientes', () => {
    socket.join('clientes-room');
    console.log(socket.id, 'en clientes-room');
  });

  socket.on('join-productos', () => {
    socket.join('productos-room');
    console.log(socket.id, 'en productos-room');
  });

  socket.on('join-mesas', () => {
    socket.join('mesas-room');
    console.log(socket.id, 'en mesas-room');
  });

  socket.on('join-mozos', () => {
    socket.join('mozos-room');
    console.log(socket.id, 'en mozos-room');
  });

  socket.on('join-gastos', () => {
    socket.join('gastos-room');
    console.log(socket.id, 'en gastos-room');
  });

  socket.on('join-tipopagos', () => {
    socket.join('tipopagos-room');
    console.log(socket.id, 'en tipopagos-room');
  });

  socket.on('disconnect', () => {
    console.log(socket.id, 'desconectado');
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
  console.log(`Socket.IO habilitado en el puerto ${port}`);
});
