const Viaje = require('../models/Viaje');

async function calcularFaseRuta(rutaId) {
  const viajeActivo = await Viaje.findOne({ ruta_id: rutaId, estado: 'activo' });
  if (viajeActivo) return 'en_curso';

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const viajeIdaHoy = await Viaje.findOne({
    ruta_id: rutaId, estado: 'finalizado', tipo_viaje: 'ida', createdAt: { $gte: hoy }
  });
  const viajeVueltaHoy = await Viaje.findOne({
    ruta_id: rutaId, estado: 'finalizado', tipo_viaje: 'vuelta', createdAt: { $gte: hoy }
  });

  if (viajeIdaHoy && viajeVueltaHoy) return 'jornada_completa';
  if (viajeIdaHoy) return 'entre_viajes';
  return 'sin_viaje';
}

module.exports = { calcularFaseRuta };
