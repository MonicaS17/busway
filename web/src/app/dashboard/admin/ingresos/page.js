'use client';
import { useState } from 'react';
import { FiBarChart2, FiDownload } from 'react-icons/fi';

const monthlyIncome = [
  { month: 'Noviembre 2025', amount: '$1,865.02' },
  { month: 'Octubre 2025', amount: '$1,796.44' },
  { month: 'Septiembre 2025', amount: '$1,743.78' },
  { month: 'Agosto 2025', amount: '$1,612.20' },
];

const payments = [
  { id: 'PAY-001', padre: 'Maria Gonzalez', conductor: 'Carlos Rodriguez', monto: '$85.00', fecha: '01 jun 2026', status: 'Exitoso' },
  { id: 'PAY-002', padre: 'Sandra Lopez', conductor: 'Roberto Diaz', monto: '$90.00', fecha: '01 jun 2026', status: 'Exitoso' },
  { id: 'PAY-003', padre: 'Pedro Nunez', conductor: 'Carlos Rodriguez', monto: '$85.00', fecha: '01 jun 2026', status: 'Fallido' },
];

export default function IngresosPage() {
  const [filterStatus, setFilterStatus] = useState('Todos');
  const filtered = filterStatus === 'Todos' ? payments : payments.filter((p) => p.status === filterStatus);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-7">
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold text-navy">
          <FiBarChart2 size={23} />
          Ingresos
        </h1>
        <p className="mt-1 text-sm text-slate-500">Consulta pagos, cierres mensuales y exportaciones.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-5 text-center">
            <p className="text-xs font-bold text-slate-500">Este mes</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">$1,865</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-5 text-center">
            <p className="text-xs font-bold text-slate-500">Este ano</p>
            <p className="mt-2 text-3xl font-extrabold text-navy">$18,240</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {monthlyIncome.map((row) => (
            <div key={row.month} className="rounded-lg border border-slate-200 px-4 py-3">
              <span className="text-sm font-bold text-slate-700">{row.month}</span>
              <span className="mt-2 block text-xl font-extrabold text-navy">{row.amount}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {['PDF', 'Excel'].map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => alert(`Exportar ${format} - conectar con la API`)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-navy hover:border-busway-blue hover:bg-blue-50/50 transition"
            >
              <FiDownload size={15} />
              {format}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-extrabold text-navy">Pagos recientes</h2>
          <div className="flex gap-2">
            {['Todos', 'Exitoso', 'Fallido'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={[
                  'rounded-lg px-3 py-1.5 text-xs font-bold transition',
                  filterStatus === s ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-busway-yellow text-navy">
              <tr>
                {['ID', 'Padre', 'Conductor', 'Monto', 'Estado'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-extrabold uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{p.id}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{p.padre}</td>
                  <td className="px-5 py-4 text-slate-600">{p.conductor}</td>
                  <td className="px-5 py-4 font-extrabold text-navy">{p.monto}</td>
                  <td className="px-5 py-4">
                    <span className={[
                      'rounded-full px-3 py-1 text-xs font-bold',
                      p.status === 'Exitoso' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
                    ].join(' ')}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
