import Link from "next/link";
import { signUp } from "@/app/auth/actions";

export default async function SignUpPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="card w-full max-w-lg p-8">
        <p className="badge mb-4">Registro</p>
        <h1 className="text-3xl font-bold">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-slate-500">Empieza con un espacio privado para organizar tus finanzas.</p>
        {error ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <form action={signUp} className="mt-6 grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Nombre</label>
            <input name="name" className="input" placeholder="Tu nombre" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input name="email" type="email" className="input" placeholder="tu@email.com" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Contraseña</label>
            <input name="password" type="password" minLength={8} className="input" placeholder="Mínimo 8 caracteres" required />
          </div>
          <button className="btn-primary">Continuar</button>
        </form>
        <p className="mt-6 text-sm text-slate-500">¿Ya tienes cuenta? <Link href="/auth/signin" className="font-semibold text-brand-700">Inicia sesión</Link></p>
      </div>
    </main>
  );
}
