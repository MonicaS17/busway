// dependencias 
const express = require('express'); // Framework para el servidor
const mongoose = require('mongoose'); // ODM para MongoDB
const cors = require('cors'); // Middleware para manejar CORS
require('dotenv').config(); // Cargar variables de entorno

const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const viajesRoutes = require('./routes/viajes');
const conductorRoutes = require('./routes/conductor').router;
const padresRoutes = require('./routes/padres');
const escuelasRoutes = require('./routes/escuelas');
const pagosRoutes = require('./routes/pagos');
const socketHandler = require('./sockets/socketHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/conductor', conductorRoutes);
app.use('/api/padre', padresRoutes);
app.use('/api/escuelas', escuelasRoutes);
app.use('/api/pagos', pagosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Backend BusWay funcionando con Sockets y Rutas de Viajes habilitadas' });
});

socketHandler(io);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    server.listen(process.env.PORT, () => {
      console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log('Error conectando a MongoDB:', error);
  });