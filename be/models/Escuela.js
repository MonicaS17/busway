const mongoose = require('mongoose');

const escuelaSchema = new mongoose.Schema({
  nombre:      { type: String, required: true },
  provincia:   { type: String, required: true },
  distrito:    { type: String, required: true },
  corregimiento: { type: String, default: '' },
  direccion:   { type: String, default: '' },
  indicaciones: { type: String, default: '' },
  lat:         { type: Number, default: 0 },
  lng:         { type: Number, default: 0 },
  rutas:       { type: Number, default: 0 },
  conductores: { type: Number, default: 0 },
  estado:      { type: String, enum: ['Activa', 'Inactiva'], default: 'Activa' },
  fecha_registro: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.models.escuelas || mongoose.model('escuelas', escuelaSchema);