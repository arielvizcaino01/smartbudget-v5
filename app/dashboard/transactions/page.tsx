import Link from "next/link";
import { Fragment } from "react";
import QuickAddTransactionModal from "@/components/dashboard/quick-add-transaction-modal";
import { Funnel, Landmark, Search, Sparkles, Wallet, Plus } from "lucide-react";
import { requireCompletedUser } from "@/lib/auth";
import { createTransaction, deleteTransaction, updateTransaction } from "@/app/dashboard/actions";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

function dateInputValue(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

const categoryStyles: Record<string, string> = {
  Comida: 'bg-orange-50 text-orange-700 border-orange-100',
  Transporte: 'bg-sky-50 text-sky-700 border-sky-100',
  Hogar: 'bg-violet-50 text-violet-700 border-violet-100',
  Entretenimiento: 'bg-pink-50 text-pink-700 border-pink-100',
  Ingresos: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  General: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default async function TransactionsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = getString(params.q);
  const type = getString(params.type);
  const category = getString(params.category);
  const account = getString(params.account);
  const from = getString(params.from);
  const to = getString(params.to);

  const user = await requireCompletedUser();

  const [categories, accounts, transactions] = await Promise.all([
    prisma.budgetCategory.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.account.findMany({ where: { userId: user.id, isActive: true }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { merchant: { contains: q, mode: "insensitive" } },
                { category: { contains: q, mode: "insensitive" } },
                { notes: { contains: q, mode: "insensitive" } },
                { account: { name: { contains: q, mode: "insensitive" } } }
              ]
            }
          : {}),
        ...(type ? { type } : {}),
        ...(category ? { category } : {}),
        ...(account ? { accountId: account } : {}),
        ...((from || to)
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {})
              }
            }
          : {})
      },
      include: { account: true },
      orderBy: { date: "desc" }
    })
  ]);

  const incomeTotal = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <section id="quick-add" className="card overflow-hidden p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2"><h2 className="text-xl font-semibold">Registro rápido de movimiento</h2><span className="badge gap-2"><Sparkles className="h-3.5 w-3.5" />modal premium</span></div>
            <p className="text-sm text-slate-500">Ahora puedes registrar desde un modal rápido y mantener esta vista como panel de control de tus movimientos.</p>
          </div>
          <div className="grid gap-2 text-sm text-slate-500 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="block text-xs uppercase tracking-wide">Resultados</span><span className="text-lg font-semibold text-slate-900">{transactions.length}</span></div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3"><span className="block text-xs uppercase tracking-wide text-emerald-700">Ingresos</span><span className="text-lg font-semibold text-emerald-700">{formatCurrency(incomeTotal)}</span></div>
            <div className="rounded-2xl bg-rose-50 px-4 py-3"><span className="block text-xs uppercase tracking-wide text-rose-700">Gastos</span><span className="text-lg font-semibold text-rose-700">{formatCurrency(expenseTotal)}</span></div>
          </div>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-900 p-5 text-white">
            <p className="text-sm text-slate-300">Flujo rápido</p>
            <h3 className="text-2xl font-semibold">Categoría → monto → cuenta</h3>
            <p className="max-w-xl text-sm text-slate-300">Toca el botón y registra un ingreso o gasto sin llenar una pantalla larga. La cuenta se ajusta al guardar y el presupuesto se actualiza automáticamente.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 px-4 py-4"><span className="text-xs uppercase tracking-wide text-slate-300">Paso 1</span><p className="mt-2 font-medium">Elige categoría</p></div>
              <div className="rounded-2xl bg-white/10 px-4 py-4"><span className="text-xs uppercase tracking-wide text-slate-300">Paso 2</span><p className="mt-2 font-medium">Escribe monto</p></div>
              <div className="rounded-2xl bg-white/10 px-4 py-4"><span className="text-xs uppercase tracking-wide text-slate-300">Paso 3</span><p className="mt-2 font-medium">Selecciona cuenta</p></div>
            </div>
          </div>
          <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">Alta rápida</p>
            <QuickAddTransactionModal categories={categories} accounts={accounts} action={createTransaction as never} />
            <p className="text-sm text-slate-500">Desde móvil verás un botón flotante y desde escritorio un botón directo para abrir el modal.</p>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Consejo: usa <span className="font-medium text-slate-900">Auto</span> cuando quieras que la app sugiera la categoría según el nombre o el comercio.
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-slate-400" />
            <div>
              <h3 className="text-lg font-semibold">Filtros rápidos</h3>
              <p className="text-sm text-slate-500">Busca por texto, fecha, tipo, categoría o cuenta.</p>
            </div>
          </div>
          <span className="badge gap-2"><Funnel className="h-3.5 w-3.5" />chips inteligentes</span>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <a href="/dashboard/transactions?type=expense" className={`rounded-full px-4 py-2 text-sm font-medium transition ${type === 'expense' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Gastos</a>
          <a href="/dashboard/transactions?type=income" className={`rounded-full px-4 py-2 text-sm font-medium transition ${type === 'income' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Ingresos</a>
          {accounts.slice(0, 3).map((item) => (
            <a key={item.id} href={`/dashboard/transactions?account=${item.id}`} className={`rounded-full px-4 py-2 text-sm font-medium transition ${account === item.id ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}>
              {item.name}
            </a>
          ))}
          {categories.slice(0, 4).map((item) => (
            <a key={item.id} href={`/dashboard/transactions?category=${encodeURIComponent(item.name)}`} className={`rounded-full px-4 py-2 text-sm font-medium transition ${category === item.name ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
              {item.name}
            </a>
          ))}
        </div>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <input name="q" defaultValue={q} className="input xl:col-span-2" placeholder="Buscar por nombre, comercio, categoría, cuenta o nota" />
          <select name="type" defaultValue={type} className="input">
            <option value="">Todos los tipos</option>
            <option value="expense">Gastos</option>
            <option value="income">Ingresos</option>
          </select>
          <select name="account" defaultValue={account} className="input">
            <option value="">Todas las cuentas</option>
            {accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <input name="from" type="date" defaultValue={from} className="input" />
          <input name="to" type="date" defaultValue={to} className="input" />
          <select name="category" defaultValue={category} className="input xl:col-span-2">
            <option value="">Todas las categorías</option>
            {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
          <div className="flex gap-3 xl:col-span-4 xl:justify-end">
            <a href="/dashboard/transactions" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">Limpiar</a>
            <button className="btn-primary">Aplicar filtros</button>
          </div>
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-semibold">Transacciones</h2>
          <p className="text-sm text-slate-500">Registro completo de movimientos con edición rápida y cuenta asociada.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Nombre</th>
                <th className="px-5 py-4 font-medium">Cuenta</th>
                <th className="px-5 py-4 font-medium">Categoría</th>
                <th className="px-5 py-4 font-medium">Fecha</th>
                <th className="px-5 py-4 font-medium">Tipo</th>
                <th className="px-5 py-4 font-medium text-right">Monto</th>
                <th className="px-5 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <Fragment key={item.id}>
                  <tr className="border-t border-slate-100 align-top">
                    <td className="px-5 py-4 font-medium">
                      <div>{item.name}</div>
                      <div className="text-xs text-slate-500">{item.merchant || "Sin comercio"}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.account?.name || "Sin cuenta"}</td>
                    <td className="px-5 py-4 text-slate-600">{item.category}</td>
                    <td className="px-5 py-4 text-slate-600">{new Date(item.date).toLocaleDateString("es-ES")}</td>
                    <td className="px-5 py-4 text-slate-600">{item.type === "income" ? "Ingreso" : "Gasto"}</td>
                    <td className={`px-5 py-4 text-right font-semibold ${item.type === "income" ? "text-emerald-600" : "text-slate-900"}`}>{item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a href={`#edit-${item.id}`} className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-50">Editar</a>
                        <form action={deleteTransaction}>
                          <input type="hidden" name="id" value={item.id} />
                          <button className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-50">Eliminar</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-t border-slate-100 bg-slate-50/70" id={`edit-${item.id}`}>
                    <td colSpan={7} className="px-5 py-4">
                      <form action={updateTransaction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <input type="hidden" name="id" value={item.id} />
                        <input name="name" defaultValue={item.name} className="input" required />
                        <input name="merchant" defaultValue={item.merchant || ""} className="input" placeholder="Comercio o fuente" />
                        <input name="amount" type="number" step="0.01" defaultValue={item.amount} className="input" required />
                        <select name="type" defaultValue={item.type} className="input">
                          <option value="expense">Gasto</option>
                          <option value="income">Ingreso</option>
                        </select>
                        <select name="accountId" defaultValue={item.accountId || ""} className="input" required>
                          <option value="">Selecciona la cuenta</option>
                          {accounts.map((accountItem) => <option key={accountItem.id} value={accountItem.id}>{accountItem.name}</option>)}
                        </select>
                        <input name="category" defaultValue={item.category} className="input" required />
                        <input name="date" type="date" defaultValue={dateInputValue(item.date)} className="input" required />
                        <input name="notes" defaultValue={item.notes || ""} className="input xl:col-span-2" placeholder="Notas" />
                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                          <input name="recurring" type="checkbox" defaultChecked={item.recurring} />
                          Recurrente
                        </label>
                        <div className="flex items-center justify-end gap-3 xl:col-span-5">
                          <a href="/dashboard/transactions" className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-50">Cerrar</a>
                          <button className="btn-primary">Guardar cambios</button>
                        </div>
                      </form>
                    </td>
                  </tr>
                </Fragment>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">No hay movimientos con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Link href="#quick-add" className="fixed bottom-24 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-slate-800 lg:bottom-6 lg:right-6">
        <Plus className="h-4 w-4" />
        Agregar
      </Link>
    </div>
  );
}
