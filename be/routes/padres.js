const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('../middleware/verifyToken');

const Usuario = mongoose.model('usuarios');

// Esquema de hijos
const hijoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  escuela: { type: String, required: true },
  conductor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios' },
  padre_id: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios', required: true },
  estado: { type: String, default: 'Activo' },
});

const Hijo = mongoose.models.hijos || mongoose.model('hijos', hijoSchema);

// GET hijos del padre
router.get('/hijos', verifyToken, async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ firebase_uid: req.user.uid });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    const hijos = await Hijo.find({ padre_id: usuario._id });
    res.json({ hijos });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET pagos del padre
router.get('/pagos', verifyToken, async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ firebase_uid: req.user.uid });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const Pago = mongoose.model('pagos');
    const pagos = await Pago.find({ padre_id: usuario._id }).sort({ fecha: -1 });

    const formateados = pagos.map((p) => ({
      id: p._id,
      fecha: new Date(p.fecha).toLocaleDateString('es-PA'),
      monto: `$${p.monto.toFixed(2)}`,
      detalle: p.detalle || 'Mensualidad',
      estado: p.estado,
    }));

    res.json({ pagos: formateados });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;