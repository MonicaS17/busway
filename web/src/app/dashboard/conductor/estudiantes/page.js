import PanelSection from '@/components/dashboard/PanelSection';

const students = [
  ['Maria Gomez', 'Colegio San Agustin', 'Ruta Norte', 'Activo'],
  ['Marcos Gomez', 'Colegio San Agustin', 'Ruta Norte', 'Activo'],
  ['Ana Ruiz', 'Colegio La Salle', 'Ruta Oeste', 'Activo'],
  ['Luis Mendoza', 'Instituto America', 'Ruta Especial', 'Activo'],
];

export default function ConductorEstudiantesPage() {
  return (
    <PanelSection title="Lista de estudiantes" description="Estudiantes que el conductor transporta actualmente.">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-busway-yellow text-xs uppercase text-navy">
              <tr>{['Estudiante', 'Escuela', 'Ruta', 'Estado'].map((h) => <th key={h} className="px-5 py-3 text-left font-bold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.join('-')}>
                  {student.map((cell) => <td key={cell} className="px-5 py-4 font-semibold text-slate-700">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PanelSection>
  );
}
