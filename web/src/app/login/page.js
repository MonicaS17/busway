'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiLock, FiMail, FiUserCheck } from 'react-icons/fi';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', role: 'admin' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (form.role === 'admin') router.push('/dashboard/admin');
      else if (form.role === 'conductor') router.push('/dashboard/conductor');
      else router.push('/dashboard/padre');
    } catch {
      setError('Correo o contrasena incorrectos. Intentalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="grid min-h-[calc(100vh-65px)] w-full lg:grid-cols-2">
        <section className="flex bg-navy px-10 py-10 text-white md:px-16">
          <div className="flex w-full flex-col items-center justify-center text-center">
            <span className="relative block h-44 w-44 overflow-hidden rounded-full border-4 border-busway-blue md:h-72 md:w-72">
              <Image
                src="/logo.jpg"
                alt="BusWay"
                fill
                sizes="288px"
                className="object-cover"
                priority
              />
            </span>

            <h1 className="mt-5 text-6xl font-black tracking-tight">
              Bus<span className="text-busway-blue">Way</span>
            </h1>

            <p className="mt-4 max-w-md text-xl font-medium leading-8 text-white/75">
              Tus hijos <span className="text-busway-blue">seguros</span> en cada ruta
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-8 py-12">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <p className="text-sm font-extrabold uppercase tracking-wider text-busway-blue">
                Bienvenido
              </p>
              <h2 className="mt-2 text-4xl font-black text-navy">
                Inicio de sesion
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Ingresa tus credenciales para acceder a BusWay.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-navy">
                  Ingresar como
                </span>
                <div className="relative">
                  <FiUserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-100 py-4 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-busway-blue focus:bg-white"
                  >
                    <option value="admin">Administrador</option>
                    <option value="conductor">Conductor</option>
                    <option value="padre">Padre de familia</option>
                  </select>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-navy">
                  Correo electronico
                </span>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-4 pl-12 pr-4 text-sm outline-none transition focus:border-busway-blue focus:bg-white"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-navy">
                  Contrasena
                </span>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="********"
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-4 pl-12 pr-4 text-sm outline-none transition focus:border-busway-blue focus:bg-white"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-busway-yellow py-4 text-sm font-extrabold text-navy shadow-md transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Ingresando...' : 'Iniciar sesion'}
              </button>

              <div className="text-center">
                <a href="#" className="text-sm font-semibold text-navy transition hover:text-busway-blue">
                  Olvidaste tu contrasena?
                </a>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
