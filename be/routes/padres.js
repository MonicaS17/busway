const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const verifyToken = require('../middleware/verifyToken');
const Usuario = require('../models/Usuario');
const Estudiante = require('../models/Estudiante');

//POST REGISTRO BÁSICO DE HIJO
router.post('/registrar-hijo', verifyToken, async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) return res.status(400).json({ error: 'El nombre del hijo es obligatorio' });

    const padre = await Usuario.findOne({ firebase_uid: req.user.uid });
    if (!padre || padre.tipo !== 'padre') {
      return res.status(403).json({ error: 'Acceso denegado. Solo los padres pueden registrar hijos' });
    }

    const nuevoEstudianteId = new mongoose.Types.ObjectId();

    const datosQR = JSON.stringify({
      estudiante_id: nuevoEstudianteId,
      nombre: nombre,
      padre_id: padre._id
    });

    const qrImagenBase64 = await QRCode.toDataURL(datosQR);

    const nuevoHijo = new Estudiante({
      _id: nuevoEstudianteId,
      nombre: nombre,
      padre_id: padre._id,
      qr_code: qrImagenBase64
    });

    await nuevoHijo.save();

    res.status(201).json({
      mensaje: 'Hijo registrado con éxito y QR generado',
      hijo: nuevoHijo
    });

  } catch (error) {
    res.status(500).json({ error: 'Error interno al registrar al hijo' });
  }
});

//GET OBTENER HIJOS DEL PADRE
router.get('/mis-hijos', verifyToken, async (req, res) => {
  try {
    const padre = await Usuario.findOne({ firebase_uid: req.user.uid });
    if (!padre) return res.status(404).json({ error: 'Padre no encontrado' });
    if (padre.tipo !== 'padre') return res.status(403).json({ error: 'Acceso exclusivo para padres' });

    const hijos = await Estudiante.find({ padre_id: padre._id })
      .populate('conductor_id', 'nombre apellido correo')
      .populate('ruta_id', 'nombre escuela zona');

    const mappedHijos = hijos.map(h => {
      const hDoc = h.toObject();
      hDoc.lat = padre.ubicacion?.lat || hDoc.lat || null;
      hDoc.lng = padre.ubicacion?.lng || hDoc.lng || null;
      
      const parts = [
        padre.ubicacion?.provincia,
        padre.ubicacion?.distrito,
        padre.ubicacion?.corregimiento,
        padre.ubicacion?.numero_casa
      ].filter(Boolean);
      hDoc.direccion = parts.length > 0 ? parts.join(', ') : (hDoc.direccion || 'Sin ubicación de recogida');
      hDoc.zona = padre.ubicacion?.corregimiento || 'Sin corregimiento';
      
      return hDoc;
    });

    res.json({ hijos: mappedHijos });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al obtener los hijos' });
  }
});

//DELETE HIJO
router.delete('/hijos/:id', verifyToken, async (req, res) => {
  try {
    const padre = await Usuario.findOne({ firebase_uid: req.user.uid });
    if (!padre) return res.status(404).json({ error: 'Padre no encontrado' });
    if (padre.tipo !== 'padre') return res.status(403).json({ error: 'Acceso exclusivo para padres' });

    const hijo = await Estudiante.findOne({ _id: req.params.id, padre_id: padre._id });
    if (!hijo) return res.status(404).json({ error: 'Hijo no encontrado o no te pertenece' });

    await Estudiante.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Hijo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al eliminar al hijo' });
  }
});

// PATCH actualizar ubicación del estudiante (recogida/entrega)
router.patch('/estudiante/:id/ubicacion', verifyToken, async (req, res) => {
  try {
    const padre = await Usuario.findOne({ firebase_uid: req.user.uid });
    if (!padre) return res.status(404).json({ error: 'Padre no encontrado' });
    if (padre.tipo !== 'padre') return res.status(403).json({ error: 'Acceso exclusivo para padres' });

    const { lat, lng, direccion } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Faltan coordenadas obligatorias: lat y lng' });
    }

    const hijo = await Estudiante.findOne({ _id: req.params.id, padre_id: padre._id });
    if (!hijo) return res.status(404).json({ error: 'Hijo no encontrado o no te pertenece' });

    hijo.lat = lat;
    hijo.lng = lng;
    if (direccion !== undefined) hijo.direccion = direccion;

    await hijo.save();

    res.json({ mensaje: 'Ubicación de recogida guardada correctamente', hijo });
  } catch (error) {
    console.error('Error al actualizar ubicación del estudiante:', error);
    res.status(500).json({ error: 'Error interno al actualizar ubicación del estudiante' });
  }
});

module.exports = router;
