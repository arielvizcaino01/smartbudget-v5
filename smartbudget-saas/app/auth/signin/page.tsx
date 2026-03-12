import Link from "next/link";
import { signIn } from "@/app/auth/actions";

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : "";

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="badge border-white/20 bg-white/10 text-white">SmartBudget</p>
          <h1 className="mt-6 max-w-lg text-5xl font-bold tracking-tight">Controla ingresos, gastos, objetivos y suscripciones desde un solo lugar.</h1>
          <p className="mt-4 max-w-xl text-sm text-slate-300">Accede a tu cuenta para revisar movimientos, próximos cargos y el avance de tus metas.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Resumen</p><p className="mt-2 text-2xl font-semibold">Claro</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Control</p><p className="mt-2 text-2xl font-semibold">Mensual</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Acceso</p><p className="mt-2 text-2xl font-semibold">Seguro</p></div>
        </div>
      </section>
      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="card w-full max-w-md p-8">
          <p className="badge mb-4">Acceso</p>
          <h1 className="text-3xl font-bold">Inicia sesión</h1>
          <p className="mt-2 text-sm text-slate-500">Usa tu correo y contraseña para entrar a tu cuenta.</p>
          {error ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
          <form action={signIn} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input name="email" type="email" className="input" placeholder="tu@email.com" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Contraseña</label>
              <input name="password" type="password" minLength={8} className="input" placeholder="••••••••" required />
            </div>
            <button className="btn-primary w-full">Entrar</button>
          </form>
          <div className="mt-6 flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-500">¿No tienes cuenta?</span>
            <Link href="/auth/signup" className="font-semibold text-brand-700">Crear cuenta</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
