import PanelSection from '@/components/dashboard/PanelSection';
import { FiDownload } from 'react-icons/fi';

const payments = [
  ['01 jun 2026', '$170.00', 'Mensualidad Maria y Marcos', 'Pagado'],
  ['01 may 2026', '$170.00', 'Mensualidad Maria y Marcos', 'Pagado'],
  ['01 abr 2026', '$85.00', 'Mensualidad Maria', 'Pagado'],
  ['01 mar 2026', '$85.00', 'Mensualidad Maria', 'Pagado'],
];

export default function PadrePagosPage() {
  return (
    <PanelSection title="Registro de pagos" description="Historial de pagos realizados con fecha, monto, desglose y estado.">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-extrabold text-navy">Historial completo</h2>
          <div className="flex gap-2">
            {['PDF', 'Excel'].map((format) => (
              <button key={format} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-xs font-bold text-navy hover:border-busway-blue">
                <FiDownload size={14} />
                Descargar {format}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-busway-yellow text-xs uppercase text-navy">
              <tr>{['Fecha', 'Monto', 'Desglose', 'Estado'].map((h) => <th key={h} className="px-5 py-3 text-left font-bold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.join('-')}>
                  {payment.map((cell) => <td key={cell} className="px-5 py-4 font-semibold text-slate-700">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PanelSection>
  );
}
