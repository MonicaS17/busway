/**
 * Tipo de prueba: Prueba de picos (Spike Testing)
 * Nombre: spike-test.js
 * De qué trata: Simula un aumento repentino y masivo de usuarios (de 10 a 200 VUs
 *   en solo 10 segundos) para observar cómo reacciona el sistema ante una carga
 *   extrema e inesperada y hasta qué punto logra mantenerse estable antes de
 *   degradarse.
 * Tiempo: 1 minuto 30 segundos, distribuidos en 5 etapas.
 * Software: k6
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
 
export const options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '10s', target: 200 },
    { duration: '30s', target: 200 },
    { duration: '10s', target: 10 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.15'],
    http_req_duration: ['p(95)<1500'],
  },
};
 
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
 
export default function () {
  const res = http.get(`${BASE_URL}/`);
  check(res, {
    'estado 200': (r) => r.status === 200,
    'respuesta menor a 1500ms': (r) => r.timings.duration < 1500,
  });
  sleep(1);
}
 
