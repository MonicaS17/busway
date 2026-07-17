const mongoose = require('mongoose');

// Cadena de conexión a Atlas
const ATLAS_URI = 'mongodb+srv://monica_s17:Monica.s170305@cluster0.ndyjoor.mongodb.net/busway?appName=Cluster0';

async function clearBankInfo() {
  console.log('🔌 Conectando a MongoDB Atlas...');
  try {
    const conn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✓ Conectado!');

    const Usuario = conn.model('usuarios', new mongoose.Schema({
      correo: String,
      datos_conductor: Object
    }));

    // Buscar al conductor Isaac
    const conductor = await Usuario.findOne({ correo: 'isaac@outlook.com' });
    if (!conductor) {
      console.log('❌ No se encontró al conductor Isaac Serrano (isaac@outlook.com) en la base de datos.');
      await conn.close();
      return;
    }

    console.log(`👤 Conductor encontrado: ${conductor.correo}`);
    console.log('Banco actual:', conductor.datos_conductor?.banco_info);

    // Eliminar la info de banco
    if (conductor.datos_conductor) {
      conductor.datos_conductor.banco_info = null;
      // Forzar a Mongoose a guardar el cambio en el campo mixto (Object)
      Usuario.where({ _id: conductor._id }).updateOne({ 
        $set: { 'datos_conductor.banco_info': null } 
      }).then(async (res) => {
        console.log('✓ Información de cobro borrada con éxito de la base de datos.');
        console.log('Detalle de la base de datos:', res);
        await conn.close();
      }).catch(async (e) => {
        console.error('❌ Error al actualizar:', e.message);
        await conn.close();
      });
    } else {
      console.log('⚠ El conductor no tiene la propiedad datos_conductor inicializada.');
      await conn.close();
    }
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
}

clearBankInfo();
