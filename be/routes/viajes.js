const express = require('express');
const router = express.Router();
const Viaje = require('../models/Viaje');
const verifyToken = require('../middleware/verifyToken');

//Obtener el viaje activo de un conductor
router.get('/activo/conductor', verifyToken, async (req, res) => {
  try {
    // Buscamos un viaje cuyo estado sea 'activo' para el conductor autenticado
    const viajeActivo = await Viaje.findOne({ 
      conductor_id: req.user.id, 
      estado: 'activo' 
    });
    
    if (!viajeActivo) {
      return res.status(404).json({ mensaje: 'No hay ninguna ruta en progreso actualmente.' });
    }
    
    res.json(viajeActivo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el viaje activo.' });
  }
});

// Obtener el viaje activo para un padre (de sus hijos)
router.get('/activo/padre', verifyToken, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Hijo = mongoose.models.hijos || mongoose.model('hijos');
    
    // Buscar hijos del padre
    const hijos = await Hijo.find({ padre_id: req.user.id });
    if (!hijos || hijos.length === 0) {
      return res.json([]);
    }
    
    const conductorIds = hijos.map(h => h.conductor_id).filter(id => id);
    
    // Buscar viajes activos de estos conductores
    const viajesActivos = await Viaje.find({
      conductor_id: { $in: conductorIds },
      estado: 'activo'
    });
    
    res.json(viajesActivos);
  } catch (error) {
    console.error('Error al obtener viaje activo para padre:', error);
    res.status(500).json({ error: 'Error al obtener el viaje activo.' });
  }
});

// Obtener el historial completo de viajes
router.get('/historial', verifyToken, async (req, res) => {
  try {
    const query = req.user.tipo === 'conductor' 
      ? { conductor_id: req.user.id } 
      // Lógica adaptada según rol
      : { 'asistencias.hijo_id': { $in: req.user.hijos_ids || [] } };

    const historial = await Viaje.find(query).sort({ hora_salida: -1 });
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de viajes.' });
  }
});

module.exports = router;