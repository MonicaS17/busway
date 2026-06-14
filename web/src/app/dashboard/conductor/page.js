import Link from 'next/link';
import StatsCard from '@/components/dashboard/StatsCard';
import { FiCreditCard, FiTruck, FiUsers } from 'react-icons/fi';

const routes = [
  ['Ruta Norte', 'Colegio San Agustin', '14 estudiantes'],
  ['Ruta Oeste', 'Colegio La Salle', '8 estudiantes'],
];

export default function ConductorDashboard() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Panel de conductor</h1>
          <p className="mt-1 text-sm text-slate-500">Consulta rutas, escuelas, estudiantes, perfil y pagos recibidos.</p>
        </div>
        <Link href="/dashboard/conductor/perfil" className="rounded-md bg-busway-yellow px-5 py-2.5 text-sm font-extrabold text-navy">
          Ver perfil
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatsCard title="Rutas registradas" value="2" icon={<FiTruck />} />
        <StatsCard title="Escuelas" value="2" icon={<FiTruck />} color="#071634" />
        <StatsCard title="Estudiantes" value="22" icon={<FiUsers />} color="#168FE3" />
        <StatsCard title="Pagos al dia" value="18" icon={<FiCreditCard />} color="#FFC20A" />
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-extrabold text-navy">Rutas y escuelas</h2>
          <Link href="/dashboard/conductor/viajes" className="rounded-md bg-navy px-4 py-2 text-xs font-extrabold text-white">
            Ver rutas
          </Link>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {routes.map(([route, school, students]) => (
            <article key={route} className="rounded-md border border-slate-200 p-4">
              <h3 className="text-sm font-extrabold text-navy">{route}</h3>
              <p className="mt-1 text-xs text-slate-500">{school}</p>
              <p className="mt-3 text-sm font-bold text-busway-blue">{students}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
