import { requireCompletedUser } from "@/lib/auth";
import {
  createRecurringBill,
  createSubscription,
  deleteRecurringBill,
  deleteSubscription,
  updateRecurringBill,
  updateSubscription
} from "@/app/dashboard/actions";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { CalendarClock, CreditCard, Repeat2, Receipt, Search } from "lucide-react";

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

function dateInputValue(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

export default async function SubscriptionsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = getString(params.q);

  const user = await requireCompletedUser();

  const [subscriptions, recurringBills] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        userId: user.id,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { category: { contains: q, mode: "insensitive" } },
                { status: { contains: q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { nextBillingDate: "asc" }
    }),
    prisma.recurringBill.findMany({
      where: {
        userId: user.id,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { frequency: { contains: q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { dueDate: "asc" }
    })
  ]);

  const activeMonthly = subscriptions
    .filter((item) => item.status === "active")
    .reduce((sum, item) => sum + item.monthlyCost, 0);
  const upcomingWeek = subscriptions.filter((item) => new Date(item.nextBillingDate).getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000).length;
  const pendingBills = recurringBills.filter((item) => !item.isPaid).length;
  const fixedMonthly = activeMonthly + recurringBills.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden p-6 sm:p-7">
        <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="badge mb-3">Suscripciones y pagos fijos</span>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mantén bajo control tus cargos automáticos</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Revisa cuánto se va cada mes, qué cobros vienen pronto y qué pagos recurrentes ya deberías tener cubiertos.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">Costo fijo mensual</p>
              <p className="mt-2 text-3xl font-semibold">{formatCurrency(fixedMonthly)}</p>
              <p className="mt-2 text-sm text-slate-300">Entre suscripciones activas y pagos recurrentes.</p>
            </div>
            <div className="grid gap-3">
              <div className="rounded-3xl bg-brand-50 p-4">
                <p className="text-xs uppercase tracking-wide text-brand-700">Cobros en 7 días</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{upcomingWeek}</p>
              </div>
              <div className="rounded-3xl bg-amber-50 p-4">
                <p className="text-xs uppercase tracking-wide text-amber-700">Pagos pendientes</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{pendingBills}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <form className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Buscar suscripciones o pagos</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input name="q" defaultValue={q} className="input pl-10" placeholder="Nombre, categoría, estado o frecuencia" />
            </div>
          </div>
          <button className="btn-primary">Filtrar</button>
          <a href="/dashboard/subscriptions" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">Limpiar</a>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-700"><Repeat2 className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-semibold">Nueva suscripción</h2>
              <p className="text-sm text-slate-500">Añade servicios que se renuevan solos y sigue su impacto mensual.</p>
            </div>
          </div>
          <form action={createSubscription} className="grid gap-4 md:grid-cols-2">
            <input name="name" className="input" placeholder="Nombre" required />
            <input name="category" className="input" placeholder="Categoría" required />
            <input name="monthlyCost" type="number" step="0.01" className="input" placeholder="Costo mensual" required />
            <select name="renewalType" className="input" defaultValue="monthly">
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
              <option value="weekly">Semanal</option>
            </select>
            <input name="nextBillingDate" type="date" className="input" required />
            <select name="status" className="input" defaultValue="active">
              <option value="active">Activa</option>
              <option value="paused">Pausada</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <button className="btn-primary md:col-span-2 md:justify-self-end">Guardar suscripción</button>
          </form>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><Receipt className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-semibold">Nuevo pago recurrente</h2>
              <p className="text-sm text-slate-500">Registra facturas y cargos fijos que quieres vigilar cada periodo.</p>
            </div>
          </div>
          <form action={createRecurringBill} className="grid gap-4 md:grid-cols-2">
            <input name="name" className="input" placeholder="Nombre" required />
            <input name="amount" type="number" step="0.01" className="input" placeholder="Monto" required />
            <input name="dueDate" type="date" className="input" required />
            <select name="frequency" className="input" defaultValue="monthly">
              <option value="monthly">Mensual</option>
              <option value="biweekly">Quincenal</option>
              <option value="weekly">Semanal</option>
            </select>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 md:col-span-2">
              <input name="isPaid" type="checkbox" />
              Marcar como pagado al crear
            </label>
            <button className="btn-primary md:col-span-2 md:justify-self-end">Guardar pago</button>
          </form>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Suscripciones</h3>
            <span className="badge">{subscriptions.length} activas o históricas</span>
          </div>
          {subscriptions.map((item) => {
            const isActive = item.status === "active";
            return (
              <div key={item.id} className="card overflow-hidden p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-2xl p-3 ${isActive ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-600"}`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">{item.name}</h4>
                      <p className="text-sm text-slate-500">{item.category}</p>
                    </div>
                  </div>
                  <span className="badge">{item.renewalType}</span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Monto</p>
                    <p className="mt-2 text-xl font-semibold">{formatCurrency(item.monthlyCost)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Próximo cobro</p>
                    <p className="mt-2 text-base font-semibold">{new Date(item.nextBillingDate).toLocaleDateString("es-ES")}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
                    <p className="mt-2 text-base font-semibold capitalize">{item.status}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={`#edit-sub-${item.id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Editar</a>
                  <form action={deleteSubscription}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Eliminar</button>
                  </form>
                </div>

                <div id={`edit-sub-${item.id}`} className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <form action={updateSubscription} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={item.id} />
                    <input name="name" defaultValue={item.name} className="input" required />
                    <input name="category" defaultValue={item.category} className="input" required />
                    <input name="monthlyCost" type="number" step="0.01" defaultValue={item.monthlyCost} className="input" required />
                    <select name="renewalType" defaultValue={item.renewalType} className="input">
                      <option value="monthly">Mensual</option>
                      <option value="yearly">Anual</option>
                      <option value="weekly">Semanal</option>
                    </select>
                    <input name="nextBillingDate" type="date" defaultValue={dateInputValue(item.nextBillingDate)} className="input" required />
                    <select name="status" defaultValue={item.status} className="input">
                      <option value="active">Activa</option>
                      <option value="paused">Pausada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                    <div className="flex items-center justify-end gap-3 md:col-span-2">
                      <a href="/dashboard/subscriptions" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cerrar</a>
                      <button className="btn-primary">Guardar cambios</button>
                    </div>
                  </form>
                </div>
              </div>
            );
          })}
          {subscriptions.length === 0 && <div className="card p-8 text-center text-slate-500">No hay suscripciones con ese filtro.</div>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pagos recurrentes</h3>
            <span className="badge">{recurringBills.length} resultados</span>
          </div>
          {recurringBills.map((item) => (
            <div key={item.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><CalendarClock className="h-5 w-5" /></div>
                  <div>
                    <h4 className="text-lg font-semibold">{item.name}</h4>
                    <p className="text-sm text-slate-500">{item.frequency} · vence {new Date(item.dueDate).toLocaleDateString("es-ES")}</p>
                  </div>
                </div>
                <span className="badge">{item.isPaid ? "Pagado" : "Pendiente"}</span>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Monto</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(item.amount)}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a href={`#edit-bill-${item.id}`} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Editar</a>
                <form action={deleteRecurringBill}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Eliminar</button>
                </form>
              </div>

              <div id={`edit-bill-${item.id}`} className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <form action={updateRecurringBill} className="grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={item.id} />
                  <input name="name" defaultValue={item.name} className="input" required />
                  <input name="amount" type="number" step="0.01" defaultValue={item.amount} className="input" required />
                  <input name="dueDate" type="date" defaultValue={dateInputValue(item.dueDate)} className="input" required />
                  <select name="frequency" defaultValue={item.frequency} className="input">
                    <option value="monthly">Mensual</option>
                    <option value="biweekly">Quincenal</option>
                    <option value="weekly">Semanal</option>
                  </select>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 md:col-span-2">
                    <input name="isPaid" type="checkbox" defaultChecked={item.isPaid} />
                    Marcar como pagado
                  </label>
                  <div className="flex items-center justify-end gap-3 md:col-span-2">
                    <a href="/dashboard/subscriptions" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cerrar</a>
                    <button className="btn-primary">Guardar cambios</button>
                  </div>
                </form>
              </div>
            </div>
          ))}
          {recurringBills.length === 0 && <div className="card p-8 text-center text-slate-500">No hay pagos recurrentes con ese filtro.</div>}
        </div>
      </section>
    </div>
  );
}
