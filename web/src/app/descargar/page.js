import Link from 'next/link';
import { PublicPage, InfoCard } from '@/components/PublicPage';

export default function DescargarPage() {
  return (
    <PublicPage
      title="Instala BusWay en tu teléfono"
      description="Los botones redirigen a la tienda correspondiente."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard title="Android">
          <p>Descarga BusWay desde Google Play para usar las funciones moviles de la ruta escolar.</p>
          <Link href="https://play.google.com/store" className="mt-5 inline-flex rounded-md bg-busway-yellow px-5 py-3 text-sm font-extrabold text-navy">
            Google Play
          </Link>
        </InfoCard>
        <InfoCard title="iOS">
          <p>Descarga BusWay desde App Store para recibir avisos y controlar la ruta escolar desde iPhone.</p>
          <Link href="https://www.apple.com/app-store/" className="mt-5 inline-flex rounded-md bg-navy px-5 py-3 text-sm font-extrabold text-white">
            App Store
          </Link>
        </InfoCard>
      </div>
    </PublicPage>
  );
}
