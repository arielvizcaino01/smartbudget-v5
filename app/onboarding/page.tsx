import { completeOnboarding } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await requireUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="card w-full max-w-2xl p-8">
        <p className="badge mb-4">Onboarding</p>
        <h1 className="text-3xl font-bold">Configura tu espacio</h1>
        <p className="mt-2 text-sm text-slate-500">Completa estos datos para personalizar tus presupuestos y tu panel inicial.</p>
        <form action={completeOnboarding} className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Nombre</label>
            <input name="name" defaultValue={user.name} className="input" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Moneda principal</label>
            <select name="currency" className="input" defaultValue={user.currency || "USD"}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="MXN">MXN</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Ingreso mensual estimado</label>
            <input name="monthlyIncome" type="number" step="0.01" defaultValue={user.monthlyIncome || 0} className="input" placeholder="4500" required />
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600 md:col-span-2">
            Esto creará una base inicial de categorías para que puedas empezar a registrar gastos sin tener que configurarlo todo a mano.
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="btn-primary">Entrar al dashboard</button>
          </div>
        </form>
      </div>
    </main>
  );
}
