const mongoose = require('mongoose');
const axios = require('axios');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/busway');
  console.log('Conectado a la BD.');

  const Usuario = mongoose.model('usuarios', new mongoose.Schema({}, { strict: false }));
  
  // Find a conductor
  const conductor = await Usuario.findOne({ tipo: 'conductor' });
  console.log('Conductor encontrado:', conductor ? `${conductor.nombre} (uid: ${conductor.firebase_uid})` : 'ninguno');

  // Find a padre
  const padre = await Usuario.findOne({ tipo: 'padre' });
  console.log('Padre encontrado:', padre ? `${padre.nombre} (uid: ${padre.firebase_uid})` : 'ninguno');

  if (conductor) {
    try {
      console.log('Enviando actualización para Conductor...');
      const res = await axios.patch('http://localhost:3000/api/auth/perfil/actualizar', {
        nombre: 'ConductorTest',
        apellido: 'ApTest',
        telefono: '6600-1122'
      }, {
        headers: {
          Authorization: `Bearer mock_token_for_${conductor.firebase_uid}`
        }
      });
      console.log('Respuesta Conductor:', res.data);
    } catch (err) {
      console.error('Error Conductor:', err.response ? err.response.data : err.message);
    }
  }

  if (padre) {
    try {
      console.log('Enviando actualización para Padre...');
      const res = await axios.patch('http://localhost:3000/api/auth/perfil/actualizar', {
        nombre: 'PadreTest',
        apellido: 'ApTest'
      }, {
        headers: {
          Authorization: `Bearer mock_token_for_${padre.firebase_uid}`
        }
      });
      console.log('Respuesta Padre:', res.data);
    } catch (err) {
      console.error('Error Padre:', err.response ? err.response.data : err.message);
    }
  }

  await mongoose.disconnect();
}

test().catch(console.error);
