const crypto = require('crypto');

function validarNombreHijo(nombre) {
  return typeof nombre === 'string' && nombre.trim().length > 0;
}

function registrarHijo(nombre) {
  if (!validarNombreHijo(nombre)) {
    throw new Error('El nombre del hijo es obligatorio');
  }

  return {
    nombre: nombre.trim(),
    qrId: generarIdentificadorQR(),
    estado: 'Pendiente',
  };
}

function generarIdentificadorQR() {
  return crypto.randomUUID();
}

function actualizarCupos(cuposDisponibles, cantidadHijosAceptados) {
  const nuevosCupos = cuposDisponibles - cantidadHijosAceptados;

  if (nuevosCupos < 0) {
    throw new Error('No hay cupos suficientes');
  }

  return nuevosCupos;
}

function registrarAsistenciaQR(estudiantes, qrId) {
  const estudiante = estudiantes.find((item) => item.qrId === qrId);

  if (!estudiante) {
    return { estudiantes, registrado: false };
  }

  const estudiantesActualizados = estudiantes.map((item) => {
    if (item.qrId !== qrId) return item;

    return {
      ...item,
      estado: 'A bordo',
      fechaEscaneo: new Date(),
    };
  });

  return { estudiantes: estudiantesActualizados, registrado: true };
}

function validarInicioRuta(estudiantes) {
  const hayEstudianteAbordo = estudiantes.some((item) => item.estado === 'A bordo');

  if (!hayEstudianteAbordo) {
    throw new Error('No se puede iniciar la ruta sin estudiantes a bordo');
  }

  return true;
}

module.exports = {
  registrarHijo,
  generarIdentificadorQR,
  actualizarCupos,
  registrarAsistenciaQR,
  validarInicioRuta,
};
