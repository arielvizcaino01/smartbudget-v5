import Link from 'next/link';

export default function HomePage() {
  const features = [
    'Registro manual de ingresos y gastos',
    'Presupuestos por categoría con alertas',
    'Seguimiento de suscripciones y pagos recurrentes',
    'Objetivos de ahorro y actividad reciente',
    'Acceso seguro, diseño móvil e instalación en pantalla de inicio'
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
      <header className="flex items-center justify-between py-4">
        <div>
          <p className="badge">SmartBudget</p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/signin" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Iniciar sesión</Link>
          <Link href="/auth/signup" className="btn-primary text-sm">Crear cuenta</Link>
        </div>
      </header>

      <section className="grid flex-1 gap-8 py-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <p className="badge mb-4">Finanzas personales</p>
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950">Tus finanzas, en un solo lugar.</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">Organiza movimientos, controla tus presupuestos, revisa cargos próximos, sigue el avance de tus objetivos y úsala como app instalada en tu teléfono.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/signup" className="btn-primary">Empezar</Link>
            <Link href="/auth/signin" className="rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700">Entrar</Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-soft">
                {feature}
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
            <p className="text-sm text-slate-300">Resumen rápido</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300">Movimientos</p>
                <p className="mt-2 text-2xl font-semibold">Registro diario</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300">Presupuestos</p>
                <p className="mt-2 text-2xl font-semibold">Límites claros</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300">Suscripciones</p>
                <p className="mt-2 text-2xl font-semibold">Próximos cargos</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-300">Objetivos</p>
                <p className="mt-2 text-2xl font-semibold">Ahorro visible</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
