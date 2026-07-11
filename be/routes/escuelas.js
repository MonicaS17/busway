const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Escuela = require('../models/Escuela');
const requireRole = require('../middleware/requireRole');

// GET todas las escuelas activas — accesible para cualquier usuario autenticado
router.get('/', verifyToken, async (req, res) => {
  try {
    const escuelas = await Escuela.find({
      estado: { $in: ['activa', 'Activa'] }
    }).sort({ nombre: 1 });
    res.json({ escuelas });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST y DELETE — solo administrador
router.post('/', verifyToken, requireRole('administrador'), async (req, res) => {
  try {
    const { nombre, provincia, distrito, direccion } = req.body;
    if (!nombre || !provincia || !distrito) {
      return res.status(400).json({ error: 'Nombre, provincia y distrito son obligatorios' });
    }
    const escuela = new Escuela({ nombre, provincia, distrito, direccion });
    await escuela.save();
    res.status(201).json({ mensaje: 'Escuela creada', escuela });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', verifyToken, requireRole('administrador'), async (req, res) => {
  try {
    const escuela = await Escuela.findByIdAndDelete(req.params.id);
    if (!escuela) return res.status(404).json({ error: 'Escuela no encontrada' });
    res.json({ mensaje: 'Escuela eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;