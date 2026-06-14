import { PublicPage, InfoCard } from '@/components/PublicPage';
import { FiCheckCircle, FiCreditCard, FiMapPin, FiMessageCircle, FiSearch, FiSmartphone } from 'react-icons/fi';

const steps = [
  {
    number: '1',
    title: 'Antes: transporte desorganizado',
    description: 'La familia no sabe con certeza donde esta el bus, si el estudiante subio o bajo, ni como dar seguimiento a pagos y comunicacion.',
    icon: FiMessageCircle,
  },
  {
    number: '2',
    title: 'Descarga y registro en la app',
    description: 'El padre descarga BusWay, crea su cuenta, registra a sus hijos y agrega los datos necesarios para usar el servicio.',
    icon: FiSmartphone,
  },
  {
    number: '3',
    title: 'Seleccion del conductor',
    description: 'La app permite filtrar por escuela, revisar perfil, cupos, ruta, documentos y resenas del conductor antes de solicitar el servicio.',
    icon: FiSearch,
  },
  {
    number: '4',
    title: 'Ruta en vivo y notificaciones',
    description: 'Cuando el conductor acepta la solicitud, el padre visualiza la ruta en tiempo real y recibe avisos al subir, bajar o llegar al colegio.',
    icon: FiMapPin,
  },
  {
    number: '5',
    title: 'Pagos mensuales automaticos',
    description: 'La familia registra su tarjeta y cada mes se realiza el cobro del transporte de forma organizada, con confirmacion para ambas partes.',
    icon: FiCreditCard,
  },
  {
    number: '6',
    title: 'Despues: tranquilidad y control',
    description: 'BusWay centraliza seguridad, pagos, comunicacion y seguimiento para que padres, conductores y administradores trabajen con mas confianza.',
    icon: FiCheckCircle,
  },
];

const users = [
  ['Conductor', 'Gestiona su ruta, registra asistencia con QR, comparte ubicacion y consulta pagos recibidos.'],
  ['Padre de familia', 'Visualiza la ruta en vivo, descarga QR de sus hijos, recibe notificaciones y realiza pagos mensuales.'],
  ['Administrador', 'Valida documentos, registra escuelas, supervisa usuarios y consulta ingresos de la plataforma.'],
];

export default function ComoFuncionaPage() {
  return (
    <PublicPage
      title="Como funciona la app BusWay"
      description="BusWay transforma el transporte colegial independiente en un proceso seguro, organizado y facil de seguir desde el telefono."
    >
      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-navy">Guía de uso</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Este flujo resume como una familia pasa de no tener control del transporte a usar BusWay con seguimiento,
            pagos y comunicacion centralizada.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <article key={number} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-busway-yellow text-base font-extrabold text-navy">
                  {number}
                </span>
                <div className="min-w-0">
                  <Icon className="mb-3 text-busway-blue" size={24} />
                  <h3 className="text-base font-extrabold text-navy">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-busway-blue/20 bg-white p-5 shadow-sm">
          <p className="text-sm leading-6 text-slate-600">
            <span className="font-extrabold text-navy"> BusWay brinda mayor seguridad, organizacion,
            confianza y transparencia para padres, conductores y estudiantes durante cada ruta escolar.
            </span>
          </p>
        </div>
      </section>
    </PublicPage>
  );
}
