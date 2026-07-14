/**
 * Tipo de prueba: Prueba de estrés (Stress Testing)
 * Nombre: stress-test.js
 * De qué trata: Simula un incremento progresivo de usuarios (de 20 hasta 150 VUs)
 *   más allá de los límites normales de uso, para identificar el punto de ruptura
 *   del servidor, es decir, el momento en que el tiempo de respuesta o la tasa de
 *   errores supera el umbral aceptable.
 * Tiempo: 2 minutos 30 segundos, distribuidos en 5 etapas graduales.
 * Software: k6
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
 
export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 150 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<1200'],
  },
};
 
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
 
export default function () {
  const res = http.get(`${BASE_URL}/`);
  check(res, {
    'estado 200': (r) => r.status === 200,
    'respuesta menor a 1200ms': (r) => r.timings.duration < 1200,
  });
  sleep(1);
}
