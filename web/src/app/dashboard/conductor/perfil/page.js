import PanelSection, { DataCard } from '@/components/dashboard/PanelSection';

const driverInfo = [
  ['Nombre', 'Juan Perez'],
  ['Correo electronico', 'juan@email.com'],
  ['Telefono', '+507 6555-1020'],
  ['Licencia', 'C-001245'],
];

const busInfo = [
  ['Placa', 'BUS-2045'],
  ['Cupos disponibles', '12 / 20'],
  ['Escuela principal', 'Colegio San Agustin'],
  ['Zona', 'La Chorrera'],
];

function ReadOnlyField({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-navy">{value}</p>
    </div>
  );
}

function ProfilePhoto({ initials, name }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-navy p-6 text-center text-white">
      <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-busway-yellow text-4xl font-extrabold text-navy shadow-sm ring-4 ring-white/10">
        {initials}
      </div>
      <div className="mt-4 min-w-0">
        <p className="text-xs font-bold uppercase text-white/60">Conductor</p>
        <h2 className="mt-1 text-2xl font-extrabold">{name}</h2>
        <p className="mt-1 text-sm font-medium text-white/70">Dueno de la cuenta</p>
      </div>
    </div>
  );
}

export default function ConductorPerfilPage() {
  return (
    <PanelSection title="Perfil" description="Consulta tus datos, bus asignado, cupos y escuelas asociadas.">
      <div className="grid gap-5 lg:grid-cols-2">
        <DataCard title="Datos del conductor">
          <div className="space-y-5">
            <ProfilePhoto initials="JP" name="Juan Perez" />
            <div className="grid gap-3 sm:grid-cols-2">
              {driverInfo.map(([label, value]) => (
                <ReadOnlyField key={label} label={label} value={value} />
              ))}
            </div>
          </div>
        </DataCard>
        <DataCard title="Bus y escuelas">
          <div className="grid gap-3 sm:grid-cols-2">
            {busInfo.map(([label, value]) => (
              <ReadOnlyField key={label} label={label} value={value} />
            ))}
          </div>
        </DataCard>
      </div>
    </PanelSection>
  );
}
