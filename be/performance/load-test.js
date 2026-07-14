/**
 * Tipo de prueba: Prueba de carga (Load Testing)
 * Nombre: load-test.js
 * De qué trata: Evalúa cómo responde el backend de BusWay al recibir un volumen
 *   constante de solicitudes por segundo (20 usuarios virtuales concurrentes),
 *   con el fin de estresar el sistema en condiciones normales/esperadas de uso.
 * Tiempo: 1 minuto de duración constante.
 * Software: k6
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
 
export const options = {
  vus: 20,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<800'],
  },
};
 
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
 
export default function () {
  const res = http.get(`${BASE_URL}/`);
  check(res, {
    'estado 200': (r) => r.status === 200,
    'respuesta menor a 800ms': (r) => r.timings.duration < 800,
  });
  sleep(1);
}
 
