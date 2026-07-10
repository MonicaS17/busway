const {
  registrarHijo,
  generarIdentificadorQR,
  actualizarCupos,
  registrarAsistenciaQR,
  validarInicioRuta,
} = require('../utils/casosPrueba');

describe('CU-01 Registro de un hijo', () => {
  test('registra correctamente un hijo cuando el nombre es valido', () => {
    const hijo = registrarHijo('Juan Perez');

    expect(hijo.nombre).toBe('Juan Perez');
    expect(hijo.qrId).toBeTruthy();
    expect(hijo.estado).toBe('Pendiente');
  });

  test('rechaza el registro cuando el nombre esta vacio', () => {
    expect(() => registrarHijo('')).toThrow('El nombre del hijo es obligatorio');
  });

  test('rechaza el registro cuando el nombre solo contiene espacios', () => {
    expect(() => registrarHijo('   ')).toThrow('El nombre del hijo es obligatorio');
  });
});

describe('CU-02 Generacion de QR unico por estudiante', () => {
  test('genera un identificador unico para cada estudiante', () => {
    const primerEstudiante = registrarHijo('Ana Lopez');
    const segundoEstudiante = registrarHijo('Carlos Ruiz');

    expect(primerEstudiante.qrId).toBeTruthy();
    expect(segundoEstudiante.qrId).toBeTruthy();
    expect(primerEstudiante.qrId).not.toBe(segundoEstudiante.qrId);
  });

  test('dos identificadores generados directamente no son iguales', () => {
    const primerQR = generarIdentificadorQR();
    const segundoQR = generarIdentificadorQR();

    expect(primerQR).not.toBe(segundoQR);
  });
});

describe('CU-03 Actualizacion de cupos al aceptar una solicitud', () => {
  test('disminuye los cupos segun el numero de hijos aceptados', () => {
    const cuposRestantes = actualizarCupos(5, 2);

    expect(cuposRestantes).toBe(3);
  });

  test('no permite obtener cupos negativos', () => {
    expect(() => actualizarCupos(1, 2)).toThrow('No hay cupos suficientes');
  });
});

describe('CU-04 Registro de asistencia mediante QR', () => {
  test('cambia el estado a A bordo cuando el identificador QR es valido', () => {
    const estudiantes = [
      { nombre: 'Ana Lopez', qrId: 'qr-valido', estado: 'Pendiente' },
      { nombre: 'Carlos Ruiz', qrId: 'qr-otro', estado: 'Pendiente' },
    ];

    const resultado = registrarAsistenciaQR(estudiantes, 'qr-valido');
    const estudianteActualizado = resultado.estudiantes[0];

    expect(resultado.registrado).toBe(true);
    expect(estudianteActualizado.estado).toBe('A bordo');
    expect(estudianteActualizado.fechaEscaneo).toBeInstanceOf(Date);
    expect(resultado.estudiantes[1].estado).toBe('Pendiente');
  });

  test('no modifica estudiantes cuando el identificador QR es invalido', () => {
    const estudiantes = [
      { nombre: 'Ana Lopez', qrId: 'qr-valido', estado: 'Pendiente' },
    ];

    const resultado = registrarAsistenciaQR(estudiantes, 'qr-invalido');

    expect(resultado.registrado).toBe(false);
    expect(resultado.estudiantes).toEqual(estudiantes);
  });
});

describe('CU-05 Validacion para iniciar una ruta', () => {
  test('permite iniciar una ruta si existe al menos un estudiante A bordo', () => {
    const estudiantes = [
      { nombre: 'Ana Lopez', estado: 'Pendiente' },
      { nombre: 'Carlos Ruiz', estado: 'A bordo' },
    ];

    expect(validarInicioRuta(estudiantes)).toBe(true);
  });

  test('devuelve error si no hay estudiantes a bordo', () => {
    const estudiantes = [
      { nombre: 'Ana Lopez', estado: 'Pendiente' },
      { nombre: 'Carlos Ruiz', estado: 'Pendiente' },
    ];

    expect(() => validarInicioRuta(estudiantes)).toThrow(
      'No se puede iniciar la ruta sin estudiantes a bordo'
    );
  });
});
