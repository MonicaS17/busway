const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// --- DEFINICIÓN DE MODELOS TEMPORALES ---
const Vehiculo = mongoose.models.Vehiculo || mongoose.model('Vehiculo', new mongoose.Schema({}, { strict: false }), 'vehiculos');
const Escuela = mongoose.models.Escuela || mongoose.model('Escuela', new mongoose.Schema({}, { strict: false }), 'escuelas');
const Ruta = mongoose.models.Ruta || mongoose.model('Ruta', new mongoose.Schema({}, { strict: false }), 'rutas');
const Estudiante = mongoose.models.Estudiante || mongoose.model('Estudiante', new mongoose.Schema({}, { strict: false }), 'estudiantes');

// --- DATOS NUEVOS (Vehículos, Escuelas, Rutas) ---
const vehiculosData = [
  {
    _id: new mongoose.Types.ObjectId("6a30a225a2c196d148097e52"),
    conductor_id: new mongoose.Types.ObjectId("6a30a225a2c196d148097e4f"),
    placa: "BC-8888",
    marca: "Toyota",
    modelo: "Coaster",
    anio: 2020,
    num_asientos: 30,
    estado_verificacion: "aprobado",
    fecha_vencimiento_verificacion: null,
    createdAt: new Date("2026-06-16T01:08:53.923Z"),
    updatedAt: new Date("2026-06-16T01:08:53.923Z")
  }
];

const escuelasData = [
  { _id: new mongoose.Types.ObjectId("6a41e8c673f83a48eac56965"), nombre: "Colegio Pedro Pablo Sánchez", distrito: "La Chorrera", rutas: 0, conductores: 0, estado: "activa", fecha_registro: new Date("2026-06-29T03:38:46.683Z") },
  { _id: new mongoose.Types.ObjectId("6a41e8c673f83a48eac56966"), nombre: "Escuela Secundaria Pedro Pablo Sánchez", distrito: "La Chorrera", rutas: 0, conductores: 0, estado: "activa", fecha_registro: new Date("2026-06-29T03:38:46.684Z") },
  { _id: new mongoose.Types.ObjectId("6a41e8c673f83a48eac56967"), nombre: "Colegio Moisés Castillo Ocaña", distrito: "La Chorrera", rutas: 0, conductores: 0, estado: "activa", fecha_registro: new Date("2026-06-29T03:38:46.684Z") },
  { _id: new mongoose.Types.ObjectId("6a41e8c673f83a48eac56968"), nombre: "Escuela Victoria D'Giscard", distrito: "La Chorrera", rutas: 0, conductores: 0, estado: "activa", fecha_registro: new Date("2026-06-29T03:38:46.684Z") },
  { _id: new mongoose.Types.ObjectId("6a41e8c673f83a48eac56969"), nombre: "Colegio San Agustín", distrito: "Arraiján", rutas: 0, conductores: 0, estado: "activa", fecha_registro: new Date("2026-06-29T03:38:46.684Z") },
  { _id: new mongoose.Types.ObjectId("6a41e8c673f83a48eac5696a"), nombre: "Colegio La Academia", distrito: "Arraiján", rutas: 0, conductores: 0, estado: "activa", fecha_registro: new Date("2026-06-29T03:38:46.684Z") },
  { _id: new mongoose.Types.ObjectId("6a41e8c673f83a48eac5696b"), nombre: "Escuela República de Panamá", distrito: "Panamá", rutas: 0, conductores: 0, estado: "activa", fecha_registro: new Date("2026-06-29T03:38:46.684Z") },
  { _id: new mongoose.Types.ObjectId("6a41e8c673f83a48eac5696c"), nombre: "Instituto Rubiano", distrito: "San Miguelito", rutas: 0, conductores: 0, estado: "activa", fecha_registro: new Date("2026-06-29T03:38:46.684Z") }
];

const rutasData = [
  {
    _id: new mongoose.Types.ObjectId("6a41d0cc2b0ee3869e08d33a"),
    nombre: "Grupo de la Mañana",
    escuela: "Colegio San Agustín",
    escuela_id: new mongoose.Types.ObjectId("6a41e8c673f83a48eac56969"),
    nombre_ruta: "Grupo de la Mañana",
    conductor_id: new mongoose.Types.ObjectId("6a30a225a2c196d148097e4f"),
    zona: "Este",
    horario_salida: "5:30 AM",
    horario_llegada: "7:00 AM",
    frecuencia: ["Lunes", "Martes", "Jueves", "Viernes"],
    estado: "activa",
    estudiantes: [
      new mongoose.Types.ObjectId("6a309638104a9846d103cf2e"),
      new mongoose.Types.ObjectId("6a30a30c23542a34215ebab6"),
      new mongoose.Types.ObjectId("6a30a33423542a34215ebab8")
    ],
    puntos_trayectoria: [],
    createdAt: new Date("2026-06-29T01:56:28.179Z"),
    updatedAt: new Date("2026-06-29T01:56:28.179Z")
  },
  {
    _id: new mongoose.Types.ObjectId("6a41d2ac2b0ee3869e08d33c"),
    nombre: "Grupo de la Tarde",
    escuela: "Escuela República de Panamá",
    escuela_id: new mongoose.Types.ObjectId("6a41e8c673f83a48eac5696b"),
    nombre_ruta: "Grupo de la Tarde",
    conductor_id: new mongoose.Types.ObjectId("6a30a225a2c196d148097e4f"),
    zona: "Sur",
    horario_salida: "11:30 AM",
    horario_llegada: "1:00 PM",
    frecuencia: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    estado: "activa",
    estudiantes: [],
    puntos_trayectoria: [],
    createdAt: new Date("2026-06-29T02:04:28.321Z"),
    updatedAt: new Date("2026-06-29T02:04:28.321Z")
  },
  {
    _id: new mongoose.Types.ObjectId("6a41e977ef40536040c9bc39"),
    nombre: "Ruta Chepo Tarde",
    escuela: "Colegio Moisés Castillo Ocaña",
    escuela_id: new mongoose.Types.ObjectId("6a41e8c673f83a48eac56967"),
    nombre_ruta: "Ruta Chepo Tarde",
    conductor_id: new mongoose.Types.ObjectId("6a30a225a2c196d148097e4f"),
    zona: "Chepo",
    horario_salida: "11:00 AM",
    horario_llegada: "1:05 PM",
    frecuencia: ["Lunes", "Viernes", "Miércoles"],
    estado: "activa",
    estudiantes: [],
    puntos_trayectoria: [],
    createdAt: new Date("2026-06-29T03:41:43.978Z"),
    updatedAt: new Date("2026-06-29T03:41:43.978Z")
  }
];

// --- MAPEO DE ASIGNACIÓN DE RUTAS ---
const asignacionRutasExistentes = [
  { _id: "6a309638104a9846d103cf2e", ruta_id: new mongoose.Types.ObjectId("6a41d0cc2b0ee3869e08d33a") }, // Juanin
  { _id: "6a30a30c23542a34215ebab6", ruta_id: new mongoose.Types.ObjectId("6a41d0cc2b0ee3869e08d33a") }, // Ceferino JR
  { _id: "6a30a33423542a34215ebab8", ruta_id: new mongoose.Types.ObjectId("6a41d0cc2b0ee3869e08d33a") }  // Sofía
];

// --- OBJETO DE INSERCIÓN COMPLETO PARA MARÍA ESTUDIANTE FALTANTE ---
const mariaFaltanteData = {
  _id: new mongoose.Types.ObjectId("6a41ac5fe42c0697e7baa165"),
  nombre: "María",
  padre_id: new mongoose.Types.ObjectId("6a30a225a2c196d148097e51"),
  conductor_id: new mongoose.Types.ObjectId("6a30a225a2c196d148097e4f"),
  ruta_id: null, // Sin ruta inicial
  qr_code: "data:image/png;base64,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",
  estado: "Activo",
  fecha_registro: new Date("2026-06-28T23:21:03.586Z"),
  __v: 0
};

async function ejecutarSincronizacion() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI no está definida en el .env');
      process.exit(1);
    }

    console.log('⏳ Conectando con MongoDB');
    await mongoose.connect(mongoUri);
    console.log('✅ Conexión establecida.');

    // Recrear las colecciones faltantes
    console.log('🧹 Limpiando e insertando colecciones faltantes (Vehículos, Escuelas, Rutas)');
    await Vehiculo.deleteMany({});
    await Vehiculo.insertMany(vehiculosData);
    
    await Escuela.deleteMany({});
    await Escuela.insertMany(escuelasData);
    
    await Ruta.deleteMany({});
    await Ruta.insertMany(rutasData);
    console.log('   ✓ Colecciones inyectadas de forma limpia.');

    // Actualizar estudiantes existentes
    console.log('⚙️ Sincronizando campo "ruta_id" en los estudiantes existentes');
    
    // Asignamos por defecto ruta_id: null a lo que ya tengan para alinear la estructura
    await Estudiante.updateMany(
      { ruta_id: { $exists: false } },
      { $set: { ruta_id: null } }
    );

    for (const asignacion of asignacionRutasExistentes) {
      await Estudiante.updateOne(
        { _id: new mongoose.Types.ObjectId(asignacion._id) },
        { $set: { ruta_id: asignacion.ruta_id } }
      );
    }
    console.log('   ✓ Juanin, Ceferino Jr y Sofía actualizados.');

    // insertar al estudiante faltante (María)
    console.log('👤 Verificando e inyectando al estudiante faltante (María)');
    await Estudiante.updateOne(
      { _id: mariaFaltanteData._id },
      { $set: mariaFaltanteData },
      { upsert: true }
    );
    console.log('   ✓ Registro de María sincronizado correctamente.');

    console.log('✅ Data sincronizada exitosamente.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en el proceso de sincronización:', error);
    process.exit(1);
  }
}

ejecutarSincronizacion();