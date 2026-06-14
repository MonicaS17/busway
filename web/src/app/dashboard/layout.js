'use client';
import Sidebar from '@/components/dashboard/Sidebar';
import { usePathname } from 'next/navigation';

function getRole(pathname) {
  if (pathname.includes('/admin')) return 'admin';
  if (pathname.includes('/conductor')) return 'conductor';
  return 'padre';
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const role = getRole(pathname);

  return (
    <div className="flex min-h-screen bg-busway-light">
      <Sidebar role={role} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
