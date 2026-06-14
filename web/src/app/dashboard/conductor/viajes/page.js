import PanelSection from '@/components/dashboard/PanelSection';//cambiar a datos reales cuando el backend esté listo

const routes = [
  ['Ruta Norte', 'Colegio San Agustin', 'La Chorrera', '14 estudiantes', 'Lunes a viernes'],
  ['Ruta Oeste', 'Colegio La Salle', 'Arraijan', '8 estudiantes', 'Lunes a viernes'],
  ['Ruta Especial', 'Instituto America', 'Panama Oeste', '4 estudiantes', 'Sabados'],
];

export default function ConductorRutasPage() {
  return (
    <PanelSection title="Registro de rutas" description="Rutas asignadas con escuelas, zonas y estudiantes transportados.">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-busway-yellow text-xs uppercase text-navy">
              <tr>{['Ruta', 'Escuela', 'Zona', 'Estudiantes', 'Frecuencia'].map((h) => <th key={h} className="px-5 py-3 text-left font-bold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routes.map((route) => (
                <tr key={route.join('-')}>
                  {route.map((cell) => <td key={cell} className="px-5 py-4 font-semibold text-slate-700">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PanelSection>
  );
}
