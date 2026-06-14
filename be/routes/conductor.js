const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('../middleware/verifyToken');

const Usuario = mongoose.model('usuarios');
const Vehiculo = mongoose.model('vehiculos');

// Esquema de estudiantes
const estudianteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  escuela: { type: String, required: true },
  ruta: { type: String, required: true },
  conductor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios', required: true },
  estado: { type: String, default: 'Activo' },
});

const Estudiante = mongoose.models.estudiantes || mongoose.model('estudiantes', estudianteSchema);

// GET perfil del conductor + vehículo
router.get('/perfil', verifyToken, async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ firebase_uid: req.user.uid });
    if (!usuario) return res.status(404).json({ error: 'Conductor no encontrado' });

    const vehiculo = await Vehiculo.findOne({ conductor_id: usuario._id });

    res.json({ usuario, vehiculo });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET estudiantes del conductor
router.get('/estudiantes', verifyToken, async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ firebase_uid: req.user.uid });
    const estudiantes = await Estudiante.find({ conductor_id: usuario._id });
    res.json({ estudiantes });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = { router, Estudiante };