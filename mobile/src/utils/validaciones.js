// Valida cédula panameña o de extranjero
export const validarCedula = (cedula) => {
  // Panameño: 8-1020-102 / 4-714-7 / 8-123-4567
  const panameño = /^\d{1,2}-\d{3,4}-\d{1,6}$/;
  // Extranjero: E-8-123456
  const extranjero = /^E-\d{1,2}-\d{1,6}$/;
  // PE: PE-123-456
  const pe = /^PE-\d{3,4}-\d{1,6}$/;

  return panameño.test(cedula) || extranjero.test(cedula) || pe.test(cedula);
};

// Valida formato de correo
export const validarCorreo = (correo) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
};

// Valida contraseña
export const validarContrasena = (contrasena) => {
  return contrasena.length >= 6;
};

// Valida teléfono panameño
export const validarTelefono = (telefono) => {
  const regex = /^[6-9]\d{3}-\d{4}$/;
  return regex.test(telefono);
};

// Mensajes de error amigables de Firebase
export const mensajeFirebase = (codigo) => {
  switch (codigo) {
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado en BusWay';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'auth/invalid-email':
      return 'El correo electrónico no es válido';
    case 'auth/user-not-found':
      return 'No encontramos una cuenta con ese correo';
    case 'auth/wrong-password':
      return 'La contraseña es incorrecta';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Espera unos minutos';
    case 'auth/network-request-failed':
      return 'Sin conexión a internet. Verifica tu red';
    default:
      return 'Ocurrió un error inesperado. Intenta de nuevo';
  }
};