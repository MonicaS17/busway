// dependencias 
const express = require('express'); // Framework para el servidor
const mongoose = require('mongoose'); // ODM para MongoDB
const cors = require('cors'); // Middleware para manejar CORS
require('dotenv').config(); // Cargar variables de entorno

// Importación de Sockets e HTTP
const http = require('http');
const { Server } = require('socket.io');

// Importación de Rutas
const authRoutes = require('./routes/auth');
const viajesRoutes = require('./routes/viajes');
const escuelasRoutes = require('./routes/escuelas');
const pagosRoutes = require('./routes/pagos');
const conductorRoutes = require('./routes/conductor'); 
const padresRoutes = require('./routes/padres');
const adminRoutes = require('./routes/admin');
const notificacionesRoutes = require('./routes/notificaciones');
const stripeRoutes = require('./routes/stripe');
const solicitudesRoutes = require('./routes/solicitudes');
const acuerdosRoutes = require('./routes/acuerdos');

const app = express();

// Servidor HTTP combinado para Express y Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Cabeceras de seguridad para mitigar riesgos (OWASP ZAP)
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Stripe webhook necesita el body raw (sin procesar) para verificar la firma
// DEBE ir antes de express.json() para que no convierta el body a objeto
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '1mb' })) 

// Middleware de logging de peticiones y errores (cero dependencias externas)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    let icon = 'ℹ️';
    if (status >= 500) {
      icon = '🔴';
    } else if (status >= 400) {
      icon = '⚠️';
    } else if (status >= 200 && status < 300) {
      icon = '🟢';
    }
    console.log(`${icon} [${req.method}] ${req.originalUrl} - Estado: ${status} (${duration}ms)`);
    
    // Si hay un error (estado >= 400), imprimimos detalles para depuración
    if (status >= 400) {
      if (req.body && Object.keys(req.body).length > 0) {
        console.log(`   └─ Body enviado:`, JSON.stringify(req.body));
      }
    }
  });
  next();
});

// Rutas base de la API
app.use('/api/auth', authRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/conductor', conductorRoutes);
app.use('/api/padre', padresRoutes);
app.use('/api/escuelas', escuelasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/acuerdos', acuerdosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Backend BusWay funcionando con Sockets y Rutas de Viajes habilitadas 🚀' });
});

// Inicialización del socketHandler real
const socketHandler = require('./sockets/socketHandler');
socketHandler(io);

// Conexión a MongoDB y Arranque del Servidor
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado exitosamente a MongoDB');
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log('❌ Error conectando a MongoDB:', error);
  });