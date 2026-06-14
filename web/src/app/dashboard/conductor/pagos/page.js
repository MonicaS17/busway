import PanelSection from '@/components/dashboard/PanelSection';
import { FiDownload } from 'react-icons/fi';

const payments = [
  ['Maria Gomez', 'Colegio San Agustin', 'Ruta Norte', '$85.00', 'Pagado', '01 jun 2026'],
  ['Marcos Gomez', 'Colegio San Agustin', 'Ruta Norte', '$85.00', 'Pagado', '01 jun 2026'],
  ['Ana Ruiz', 'Colegio La Salle', 'Ruta Oeste', '$90.00', 'Pendiente', '01 jun 2026'],
  ['Luis Mendoza', 'Instituto America', 'Ruta Especial', '$95.00', 'Pagado', '01 jun 2026'],
];

export default function ConductorPagosPage() {
  return (
    <PanelSection title="Registro de pagos de estudiantes" description="Consulta que estudiantes han pagado y descarga el historial en PDF o Excel.">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-extrabold text-navy">Historial de estudiantes</h2>
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
              <tr>{['Estudiante', 'Escuela', 'Ruta', 'Monto', 'Estado', 'Fecha'].map((h) => <th key={h} className="px-5 py-3 text-left font-bold">{h}</th>)}</tr>
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
