import PanelSection, { DataCard } from '@/components/dashboard/PanelSection';

const children = [
  ['Maria Gomez', 'Colegio San Agustin', 'Activa'],
  ['Marcos Gomez', 'Colegio San Agustin', 'Activo'],
];

const parentInfo = [
  ['Nombre', 'Carla Gomez'],
  ['Correo electronico', 'carla@email.com'],
  ['Telefono', '+507 6123-4455'],
  ['Direccion', 'La Chorrera, Panama Oeste'],
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
        <p className="text-xs font-bold uppercase text-white/60">Padre de familia</p>
        <h2 className="mt-1 text-2xl font-extrabold">{name}</h2>
        <p className="mt-1 text-sm font-medium text-white/70">Duena de la cuenta</p>
      </div>
    </div>
  );
}

export default function PadrePerfilPage() {
  return (
    <PanelSection title="Perfil" description="Informacion personal y cantidad de hijos registrados.">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <DataCard title="Datos personales">
          <div className="space-y-5">
            <ProfilePhoto initials="CG" name="Carla Gomez" />
            <div className="grid gap-3 sm:grid-cols-2">
              {parentInfo.map(([label, value]) => (
                <ReadOnlyField key={label} label={label} value={value} />
              ))}
            </div>
          </div>
        </DataCard>

        <DataCard title="Hijos registrados">
          <div className="grid gap-3 sm:grid-cols-[0.7fr_1.3fr] lg:grid-cols-1 xl:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-md bg-busway-light p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Total registrados</p>
              <p className="mt-1 text-4xl font-extrabold text-navy">2</p>
            </div>
            <div className="space-y-3 text-sm">
              {children.map(([name, school, status]) => (
                <div key={name} className="rounded-md border border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-extrabold text-navy">{name}</p>
                    <span className="rounded-full bg-busway-yellow px-2.5 py-1 text-[11px] font-extrabold text-navy">{status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{school}</p>
                </div>
              ))}
            </div>
          </div>
        </DataCard>
      </div>
    </PanelSection>
  );
}
