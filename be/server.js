//dependencias 
const express = require('express'); // Framework para el servidor
const mongoose = require('mongoose'); // ODM para MongoDB
const cors = require('cors'); // Middleware para manejar CORS
require('dotenv').config(); // Cargar variables de entorno


const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Backend BusWay funcionando' });
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log('Error conectando a MongoDB:', error);
  });