import Link from 'next/link';
import StatsCard from '@/components/dashboard/StatsCard';
import { FiCreditCard, FiDownload, FiUsers } from 'react-icons/fi';

const recentPayments = [
  ['01 jun 2026', '$170.00', 'Mensualidad Maria y Marcos', 'Pagado'],
  ['01 may 2026', '$170.00', 'Mensualidad Maria y Marcos', 'Pagado'],
  ['01 abr 2026', '$85.00', 'Mensualidad Maria', 'Pagado'],
];

export default function PadreDashboard() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Panel de padre</h1>
          <p className="mt-1 text-sm text-slate-500">Consulta tu perfil, hijos registrados e historial de pagos.</p>
        </div>
        <Link href="/dashboard/padre/perfil" className="rounded-md bg-busway-yellow px-5 py-2.5 text-sm font-extrabold text-navy">
          Ver perfil
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard title="Hijos registrados" value="2" icon={<FiUsers />} />
        <StatsCard title="Pagos realizados" value="12" icon={<FiCreditCard />} color="#071634" />
        <StatsCard title="Ultimo pago" value="$170" icon={<FiDownload />} color="#FFC20A" sub="01 jun 2026" />
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-extrabold text-navy">Pagos recientes</h2>
            <p className="mt-1 text-xs text-slate-500">El historial completo esta disponible en la seccion Pagos.</p>
          </div>
          <Link href="/dashboard/padre/pagos" className="rounded-md bg-navy px-4 py-2 text-xs font-extrabold text-white">
            Ver historial
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-busway-yellow text-xs uppercase text-navy">
              <tr>{['Fecha', 'Monto', 'Detalle', 'Estado'].map((h) => <th key={h} className="px-5 py-3 text-left font-bold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.map((payment) => (
                <tr key={payment.join('-')}>
                  {payment.map((cell) => <td key={cell} className="px-5 py-4 font-semibold text-slate-700">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
