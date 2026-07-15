const Viaje = require('../models/Viaje');
const Estudiante = require('../models/Estudiante');

exports.getViajeActivoConductor = async (req, res) => {
  try {
    const Ruta = require('../models/Ruta');
    const ruta = await Ruta.findOne({ conductor_id: req.user.id });
    if (!ruta) {
      return res.status(404).json({ error: 'Ruta no asignada a este conductor.' });
    }

    const { calcularFaseRuta } = require('../utils/viajeHelper');
    const fase = await calcularFaseRuta(ruta._id);

    let viajeActivo = await Viaje.findOne({ ruta_id: ruta._id, estado: { $in: ['activo', 'en_espera'] } });

    if (!viajeActivo && fase === 'sin_viaje') {
      const totalEstudiantes = await Estudiante.countDocuments({ conductor_id: req.user.id, ruta_id: ruta._id });

      if (totalEstudiantes > 0) {
        viajeActivo = await Viaje.create({
          ruta_id: ruta._id,
          conductor_id: req.user.id,
          estado: 'en_espera',
          tipo_viaje: 'ida',
          hora_salida: null
        });
        console.log(`Viaje de ida creado en espera automáticamente vía API ID: ${viajeActivo._id}`);
      }
    }

    return res.json({
      viaje: viajeActivo,
      fase: fase === 'en_curso' ? 'activo' : (fase === 'jornada_completa' ? 'jornada_completa' : fase)
    });
  } catch (error) {
    console.error('Error al obtener el viaje activo del conductor:', error);
    res.status(500).json({ error: 'Error al obtener el viaje activo.' });
  }
};

// Obtener el viaje activo para un padre
// Filtra con lógica estricta y fases según el día actual.
exports.getViajeActivoPadre = async (req, res) => {
  try {
    const Estudiante = require('../models/Estudiante');
    const Viaje = require('../models/Viaje');
    const { calcularFaseRuta } = require('../utils/viajeHelper');

    const parentId = req.user.id || req.user._id;
    const hijos = await Estudiante.find({ padre_id: parentId }).select('ruta_id conductor_id');

    if (!hijos.length) {
      return res.json({ viaje: null, fase: 'sin_viaje' });
    }

    const rutaIds = req.query.ruta_id
      ? [req.query.ruta_id]
      : hijos.map(h => h.ruta_id).filter(Boolean);

    if (!rutaIds.length) {
      return res.json({ viaje: null, fase: 'sin_viaje' });
    }

    const rutaId = rutaIds[0];
    const fase = await calcularFaseRuta(rutaId);

    let viajeActivo = await Viaje.findOne({ ruta_id: rutaId, estado: { $in: ['activo', 'en_espera'] } })
      .populate('ruta_id', 'nombre_ruta zona horario_salida');

    res.json({ viaje: viajeActivo, fase });
  } catch (error) {
    console.error('Error en getViajeActivoPadre:', error);
    res.status(500).json({ error: 'Error interno al obtener el viaje activo.' });
  }
};

// Obtener el historial completo de viajes
exports.getHistorialViajes = async (req, res) => {
  try {
    const query = req.user.tipo === 'conductor'
      ? { conductor_id: req.user.id }
      : { 'asistencias.hijo_id': { $in: req.user.hijos_ids || [] } };

    const historial = await Viaje.find(query).sort({ hora_salida: -1 });
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial de viajes.' });
  }
};
