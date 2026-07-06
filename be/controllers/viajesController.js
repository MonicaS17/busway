const Viaje = require('../models/Viaje');
const Estudiante = require('../models/Estudiante');

// Obtener el viaje activo de un conductor
// Filtra ÚNICAMENTE por estado: 'activo'. Si no existe → 404 limpio.
exports.getViajeActivoConductor = async (req, res) => {
  try {
    const viajeActivo = await Viaje.findOne({
      conductor_id: req.user.id,
      estado: 'activo'          // filtro estricto
    });

    if (viajeActivo) {
      return res.json({ viaje: viajeActivo, fase: 'activo' });
    }

    // Si no hay viaje activo, verificar si ya se completó la ida hoy
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const viajeIdaHoy = await Viaje.findOne({
      conductor_id: req.user.id,
      estado: 'finalizado',
      tipo_viaje: 'ida',
      createdAt: { $gte: inicioDia }
    });

    const viajeVueltaHoy = await Viaje.findOne({
      conductor_id: req.user.id,
      tipo_viaje: 'vuelta',
      createdAt: { $gte: inicioDia }
    });

    if (viajeIdaHoy && !viajeVueltaHoy) {
      return res.json({ viaje: null, fase: 'entre_viajes' });
    }

    return res.json({ viaje: null, fase: 'sin_viaje' });
  } catch (error) {
    console.error('Error al obtener el viaje activo del conductor:', error);
    res.status(500).json({ error: 'Error al obtener el viaje activo.' });
  }
};

// Obtener el viaje activo para un padre
// Filtra con lógica estricta y fases según el día actual.
exports.getViajeActivoPadre = async (req, res) => {
  try {
    const estudiantes = await Estudiante.find({ padre_id: req.user.id });
    if (!estudiantes || estudiantes.length === 0) {
      return res.json({ viaje: null, fase: 'sin_viaje' });
    }

    const conductorIds = estudiantes.map(e => e.conductor_id).filter(Boolean);
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    // Existe viaje con estado 'activo' hoy
    const viajeActivo = await Viaje.findOne({
      conductor_id: { $in: conductorIds },
      estado: 'activo',
      createdAt: { $gte: inicioDia }
    });

    if (viajeActivo) {
      return res.json({ viaje: viajeActivo, fase: 'en_curso' });
    }

    // Existe viaje tipo 'ida' con estado 'finalizado' HOY
    // Y NO existe viaje tipo 'vuelta' con estado 'activo' o 'finalizado' hoy
    const viajeIdaHoy = await Viaje.findOne({
      conductor_id: { $in: conductorIds },
      estado: 'finalizado',
      tipo_viaje: 'ida',
      createdAt: { $gte: inicioDia }
    });

    const viajeVueltaHoy = await Viaje.findOne({
      conductor_id: { $in: conductorIds },
      tipo_viaje: 'vuelta',
      createdAt: { $gte: inicioDia }
    });

    if (viajeIdaHoy && !viajeVueltaHoy) {
      return res.json({ viaje: null, fase: 'entre_viajes' });
    }

    return res.json({ viaje: null, fase: 'sin_viaje' });
  } catch (error) {
    console.error('Error al obtener viaje activo para padre:', error);
    res.status(500).json({ error: 'Error al obtener el viaje activo.' });
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
