import './globals.css';

export const metadata = {
  title: 'BusWay',
  description: 'Plataforma de transporte escolar para Panama',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
