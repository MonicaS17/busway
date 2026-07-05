const Viaje = require('../models/Viaje');

/**
 * Calcula la fase actual de una ruta para el día de hoy.
 * @param {string} rutaId 
 * @returns {Promise<'en_curso'|'jornada_completa'|'entre_viajes'|'sin_viaje'>}
 */
async function calcularFaseRuta(rutaId) {
  // Verificar si hay un viaje 'activo' ahora mismo
  const viajeActivo = await Viaje.findOne({
    ruta_id: rutaId,
    estado: 'activo'
  });

  if (viajeActivo) {
    return 'en_curso';
  }

  // Si no hay viaje activo, verificar viajes completados hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const viajeIdaHoy = await Viaje.findOne({
    ruta_id: rutaId,
    estado: 'finalizado',
    tipo_viaje: 'ida',
    createdAt: { $gte: hoy }
  });

  const viajeVueltaHoy = await Viaje.findOne({
    ruta_id: rutaId,
    estado: 'finalizado',
    tipo_viaje: 'vuelta',
    createdAt: { $gte: hoy }
  });

  if (viajeIdaHoy && viajeVueltaHoy) {
    return 'jornada_completa';
  }

  if (viajeIdaHoy) {
    return 'entre_viajes';
  }

  return 'sin_viaje';
}

module.exports = {
  calcularFaseRuta
};
