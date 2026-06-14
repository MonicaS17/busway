import { PublicPage, InfoCard } from '@/components/PublicPage';

export default function ContactoPage() {
  return (
    <PublicPage
      title="Hablemos sobre transporte escolar seguro"
      description="Canales de soporte para padres, conductores y administracion de escuelas."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <InfoCard title="Correo">
          <p>soporte@busway.pa</p>
        </InfoCard>
        <InfoCard title="Telefono">
          <p>+507 6000-0000</p>
        </InfoCard>
        <InfoCard title="Ubicacion">
          <p>Panama, Republica de Panama</p>
        </InfoCard>
      </div>
    </PublicPage>
  );
}
