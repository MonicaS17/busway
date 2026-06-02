// src/config/api.js
import { create } from 'axios';

//lee del .env, si da undefined, usamos la IP por defecto para que no se rompa
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.96.194.65:3000';

console.log('Revisando variable de entorno:', process.env.EXPO_PUBLIC_API_URL);
console.log('API configurada finalmente en:', API_URL);

const api = create({
  baseURL: API_URL,
  timeout: 10000, // Cancela la petición si el backend tarda más de 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;