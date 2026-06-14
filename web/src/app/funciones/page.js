import { PublicPage, InfoCard } from '@/components/PublicPage';

const functions = [
  ['Perfil de padre', 'El padre puede consultar su informacion personal desde el panel web.'],
  ['Hijos registrados', 'El padre puede ver cuantos hijos tiene registrados y la informacion basica asociada.'],
  ['Historial de pagos del padre', 'El padre consulta pagos realizados con fecha, monto, desglose y estado, y descarga PDF o Excel.'],
  ['Perfil de conductor', 'El conductor puede consultar su informacion personal y datos asociados al bus.'],
  ['Rutas, escuelas y estudiantes', 'El conductor revisa sus rutas registradas, escuelas asignadas y lista de estudiantes transportados.'],
  ['Pagos de estudiantes', 'El conductor consulta que estudiantes han pagado y descarga el historial en PDF o Excel.'],
];

export default function FuncionesPage() {
  return (
    <PublicPage
      title="Funciones disponibles en la web de BusWay"
      description="Está web esta enfocada en consulta, perfil e historial. Las funciones como ruta en vivo, GPS y QR pertenecen a la app movil."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {functions.map(([title, desc]) => (
          <InfoCard key={title} title={title} accent>
            <p>{desc}</p>
          </InfoCard>
        ))}
      </div>
    </PublicPage>
  );
}
