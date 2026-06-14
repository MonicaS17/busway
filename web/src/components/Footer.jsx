import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-navy px-6 py-12 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-busway-navy bg-white">
              <Image src="/logo.jpg" alt="BusWay" fill sizes="40px" className="object-cover" />
            </span>
            <div>
                 <p className="text-lg font-extrabold leading-none text-white">
                   Bus<span className="text-busway-blue">Way</span>
                 </p>
               </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            Plataforma digital de transporte escolar para Panama.
            Conectamos familias con conductores verificados.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Plataforma</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link href="/funciones" className="transition hover:text-white">Funciones web</Link></li>
            <li><Link href="/como-funciona" className="transition hover:text-white">App Móvil</Link></li>
            <li><Link href="/descargar" className="transition hover:text-white">Descargar</Link></li>
            <li><Link href="/login" className="transition hover:text-white">Iniciar sesion</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Contacto</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>soporte@busway.pa</li>
            <li>+507 6000-0000</li>
            <li>Panama, Republica de Panama</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-center text-xs text-slate-400">
        (c) {new Date().getFullYear()} BusWay - Grupo 1GS141 - Universidad Tecnologica de Panama
      </div>
    </footer>
  );
}
