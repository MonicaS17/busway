const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Escuela = require('../models/Escuela');
const requireRole = require('../middleware/requireRole');

// GET todas las escuelas activas — accesible para cualquier usuario autenticado
router.get('/', verifyToken, async (req, res) => {
  try {
    const Usuario = require('../models/Usuario');
    const Vehiculo = require('../models/Vehiculo');

    // Obtener información del usuario logueado
    const usuario = await Usuario.findOne({ firebase_uid: req.user.uid });
    
    let query = { estado: { $in: ['activa', 'Activa'] } };

    // Si es conductor, filtrar por la provincia de su placa de vehículo
    if (usuario && usuario.tipo === 'conductor') {
      const vehiculo = await Vehiculo.findOne({ conductor_id: usuario._id });
      if (vehiculo && vehiculo.placa) {
        // Usar la función robusta para extraer la provincia a partir de la placa
        const obtenerProvinciaPorPlaca = (placa) => {
          if (!placa) return null;
          const cleanPlaca = placa.trim().toUpperCase();
          const match = cleanPlaca.match(/^\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            switch (num) {
              case 1: return 'Bocas del Toro';
              case 2: return 'Coclé';
              case 3: return 'Colón';
              case 4: return 'Chiriquí';
              case 5: return 'Darién';
              case 6: return 'Herrera';
              case 7: return 'Los Santos';
              case 8: return 'Panamá';
              case 9: return 'Veraguas';
              case 10: return 'Guna Yala';
              case 11: return 'Emberá-Wounaan';
              case 12: return 'Ngäbe-Buglé';
              case 13: return 'Panamá Oeste';
              default: break;
            }
          }
          const innerMatch = cleanPlaca.match(/(?:^|[A-Z-])(\d+)(?:[A-Z-]|$)/);
          if (innerMatch) {
            const num = parseInt(innerMatch[1], 10);
            switch (num) {
              case 1: return 'Bocas del Toro';
              case 2: return 'Coclé';
              case 3: return 'Colón';
              case 4: return 'Chiriquí';
              case 5: return 'Darién';
              case 6: return 'Herrera';
              case 7: return 'Los Santos';
              case 8: return 'Panamá';
              case 9: return 'Veraguas';
              case 10: return 'Guna Yala';
              case 11: return 'Emberá-Wounaan';
              case 12: return 'Ngäbe-Buglé';
              case 13: return 'Panamá Oeste';
              default: break;
            }
          }
          return null;
        };

        const provinciaConductor = obtenerProvinciaPorPlaca(vehiculo.placa);
        if (provinciaConductor) {
          query.provincia = provinciaConductor;
        }
      }
    }

    const escuelas = await Escuela.find(query).sort({ nombre: 1 });
    res.json({ escuelas });
  } catch (error) {
    console.error('Error al obtener escuelas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST y DELETE — solo administrador
router.post('/', verifyToken, requireRole('administrador'), async (req, res) => {
  try {
    const { nombre, provincia, distrito, corregimiento, direccion, indicaciones, lat, lng } = req.body;
    if (!nombre || !provincia || !distrito) {
      return res.status(400).json({ error: 'Nombre, provincia y distrito son obligatorios' });
    }
    const escuela = new Escuela({
      nombre,
      provincia,
      distrito,
      corregimiento: corregimiento || '',
      direccion: direccion || '',
      indicaciones: indicaciones || '',
      lat: Number(lat) || 0,
      lng: Number(lng) || 0
    });
    await escuela.save();
    res.status(201).json({ mensaje: 'Escuela creada', escuela });
  } catch (error) {
    console.error('Error al crear escuela:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.patch('/:id', verifyToken, requireRole('administrador'), async (req, res) => {
  try {
    const { nombre, provincia, distrito, corregimiento, direccion, indicaciones, lat, lng, estado } = req.body;
    
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (provincia !== undefined) updateData.provincia = provincia;
    if (distrito !== undefined) updateData.distrito = distrito;
    if (corregimiento !== undefined) updateData.corregimiento = corregimiento;
    if (direccion !== undefined) updateData.direccion = direccion;
    if (indicaciones !== undefined) updateData.indicaciones = indicaciones;
    if (lat !== undefined) updateData.lat = Number(lat) || 0;
    if (lng !== undefined) updateData.lng = Number(lng) || 0;
    if (estado !== undefined) updateData.estado = estado;

    const escuela = await Escuela.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!escuela) return res.status(404).json({ error: 'Escuela no encontrada' });
    
    res.json({ mensaje: 'Escuela actualizada', escuela });
  } catch (error) {
    console.error('Error al actualizar escuela:', error);
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