'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiBarChart2,
  FiCreditCard,
  FiFileText,
  FiGrid,
  FiHome,
  FiLogOut,
  FiTruck,
  FiUser,
  FiUsers,
} from 'react-icons/fi';

const adminLinks = [
  { href: '/dashboard/admin', label: 'Inicio', icon: FiGrid },
  { href: '/dashboard/admin/usuarios', label: 'Usuarios', icon: FiUsers },
  { href: '/dashboard/admin/escuelas', label: 'Escuelas', icon: FiHome },
  { href: '/dashboard/admin/ingresos', label: 'Ingresos', icon: FiBarChart2 },
];

const conductorLinks = [
  { href: '/dashboard/conductor', label: 'Inicio', icon: FiGrid },
  { href: '/dashboard/conductor/viajes', label: 'Rutas', icon: FiTruck },
  { href: '/dashboard/conductor/estudiantes', label: 'Estudiantes', icon: FiUsers },
  { href: '/dashboard/conductor/pagos', label: 'Pagos', icon: FiCreditCard },
  { href: '/dashboard/conductor/perfil', label: 'Perfil', icon: FiUser },
];

const padreLinks = [
  { href: '/dashboard/padre', label: 'Inicio', icon: FiGrid },
  { href: '/dashboard/padre/pagos', label: 'Pagos', icon: FiCreditCard },
  { href: '/dashboard/padre/perfil', label: 'Perfil', icon: FiUser },
];

const roleProfiles = {
  admin: { label: 'Admin', name: 'Administrador', initials: 'AD' },
  conductor: { label: 'Conductor', name: 'Juan Perez', initials: 'JP' },
  padre: { label: 'Padre', name: 'Carla Gomez', initials: 'CG' },
};

export default function Sidebar({ role = 'admin' }) {
  const pathname = usePathname();
  const router = useRouter();

  const links =
    role === 'admin' ? adminLinks :
    role === 'conductor' ? conductorLinks :
    padreLinks;

  const profile = roleProfiles[role] || roleProfiles.padre;

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
    <div className="px-5 py-5 flex items-center gap-3">
    <div className="relative h-14 w-14 overflow-hidden rounded-2xl ">
      <Image
        src="/logo.jpg"
        alt="BusWay"
        fill
        sizes="56px"
        className="object-cover"
      />
    </div>

    <div className="min-w-0">
      <h1 className="text-xl font-black tracking-tight text-navy">
        Bus<span className="text-busway-blue">Way</span>
      </h1>

      <p className="text-xs font-semibold text-navy">
        tus hijos <span className="text-busway-blue">seguros</span> en cada ruta
      </p>
    </div>
</div>

      <div className="flex min-h-20 items-center justify-between gap-3 bg-navy px-5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-busway-yellow text-sm font-extrabold text-navy shadow-sm ring-2 ring-white/15">
            {profile.initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold text-white">{profile.name}</span>
            <span className="block truncate text-xs font-semibold text-white/65">{profile.label}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="flex h-9 w-9 items-center justify-center rounded-md text-white/75 transition hover:bg-white/10 hover:text-busway-yellow"
          title="Cerrar sesion"
          aria-label="Cerrar sesion"
        >
          <FiLogOut size={17} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition',
                active
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-navy',
              ].join(' ')}
            >
              <Icon size={17} className={active ? 'text-busway-yellow' : 'text-busway-blue'} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
