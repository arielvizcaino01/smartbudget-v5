import { requireCompletedUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireCompletedUser();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="card p-6">
        <h2 className="text-xl font-semibold">Cuenta</h2>
        <p className="mt-2 text-sm text-slate-500">Resumen de la configuración principal del espacio.</p>
        <div className="mt-6 space-y-4 text-sm">
          <div className="rounded-2xl bg-slate-50 p-4">Nombre: <span className="font-semibold">{user.name}</span></div>
          <div className="rounded-2xl bg-slate-50 p-4">Email: <span className="font-semibold">{user.email}</span></div>
          <div className="rounded-2xl bg-slate-50 p-4">Moneda: <span className="font-semibold">{user.currency}</span></div>
          <div className="rounded-2xl bg-slate-50 p-4">Ingreso mensual: <span className="font-semibold">{new Intl.NumberFormat("en-US", { style: "currency", currency: user.currency }).format(user.monthlyIncome)}</span></div>
        </div>
      </div>
      <div className="card p-6">
        <h2 className="text-xl font-semibold">Base lista para crecer</h2>
        <p className="mt-2 text-sm text-slate-500">Ya tienes autenticación, usuarios separados y onboarding inicial funcionando.</p>
        <ul className="mt-6 space-y-3 text-sm text-slate-700">
          <li>• Sesión con cookie segura.</li>
          <li>• Datos aislados por usuario.</li>
          <li>• Onboarding inicial con moneda e ingreso.</li>
          <li>• Neon PostgreSQL con Prisma.</li>
        </ul>
      </div>
    </div>
  );
}
