import { requireCompletedUser } from "@/lib/auth";
import { Fragment } from "react";
import { createTransaction, deleteTransaction, updateTransaction } from "@/app/dashboard/actions";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

function dateInputValue(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

export default async function TransactionsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = getString(params.q);
  const type = getString(params.type);
  const category = getString(params.category);
  const from = getString(params.from);
  const to = getString(params.to);

  const user = await requireCompletedUser();

  const [categories, transactions] = await Promise.all([
    prisma.budgetCategory.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { merchant: { contains: q, mode: "insensitive" } },
                { category: { contains: q, mode: "insensitive" } },
                { notes: { contains: q, mode: "insensitive" } }
              ]
            }
          : {}),
        ...(type ? { type } : {}),
        ...(category ? { category } : {}),
        ...((from || to)
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {})
              }
            }
          : {})
      },
      orderBy: { date: "desc" }
    })
  ]);

  const incomeTotal = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Agregar movimiento</h2>
            <p className="text-sm text-slate-500">Registra ingresos y gastos manualmente. Si dejas la categoría vacía o escribes Auto, el sistema intentará clasificarla por comercio y descripción.</p>
          </div>
          <div className="grid gap-2 text-sm text-slate-500 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="block text-xs uppercase tracking-wide">Resultados</span><span className="text-lg font-semibold text-slate-900">{transactions.length}</span></div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3"><span className="block text-xs uppercase tracking-wide text-emerald-700">Ingresos</span><span className="text-lg font-semibold text-emerald-700">{formatCurrency(incomeTotal)}</span></div>
            <div className="rounded-2xl bg-rose-50 px-4 py-3"><span className="block text-xs uppercase tracking-wide text-rose-700">Gastos</span><span className="text-lg font-semibold text-rose-700">{formatCurrency(expenseTotal)}</span></div>
          </div>
        </div>
        <form action={createTransaction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input name="name" className="input" placeholder="Nombre" required />
          <input name="merchant" className="input" placeholder="Comercio o fuente" />
          <input name="amount" type="number" step="0.01" className="input" placeholder="Monto" required />
          <select name="type" className="input" defaultValue="expense">
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
          <input name="category" list="transaction-categories" className="input" placeholder="Categoría o escribe Auto" />
          <input name="date" type="date" className="input" required />
          <input name="notes" className="input md:col-span-2" placeholder="Notas" />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <input name="recurring" type="checkbox" />
            Recurrente
          </label>
          <button className="btn-primary xl:justify-self-end">Guardar transacción</button>
        </form>
        <datalist id="transaction-categories">
          {categories.map((item) => <option key={item.id} value={item.name} />)}
          <option value="Ingresos" />
          <option value="Auto" />
          <option value="General" />
        </datalist>
      </section>

      <section className="card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Filtros</h3>
          <p className="text-sm text-slate-500">Busca por texto, fecha, tipo o categoría.</p>
        </div>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input name="q" defaultValue={q} className="input xl:col-span-2" placeholder="Buscar por nombre, comercio, categoría o nota" />
          <select name="type" defaultValue={type} className="input">
            <option value="">Todos los tipos</option>
            <option value="expense">Gastos</option>
            <option value="income">Ingresos</option>
          </select>
          <input name="from" type="date" defaultValue={from} className="input" />
          <input name="to" type="date" defaultValue={to} className="input" />
          <select name="category" defaultValue={category} className="input xl:col-span-2">
            <option value="">Todas las categorías</option>
            {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
          <div className="flex gap-3 xl:col-span-3 xl:justify-end">
            <a href="/dashboard/transactions" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">Limpiar</a>
            <button className="btn-primary">Aplicar filtros</button>
          </div>
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-semibold">Transacciones</h2>
          <p className="text-sm text-slate-500">Registro completo de movimientos con edición rápida.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Nombre</th>
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
                  <tr key={item.id} className="border-t border-slate-100 align-top">
                    <td className="px-5 py-4 font-medium">
                      <div>{item.name}</div>
                      <div className="text-xs text-slate-500">{item.merchant || "Sin comercio"}</div>
                    </td>
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
                    <td colSpan={6} className="px-5 py-4">
                      <form action={updateTransaction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <input type="hidden" name="id" value={item.id} />
                        <input name="name" defaultValue={item.name} className="input" required />
                        <input name="merchant" defaultValue={item.merchant || ""} className="input" placeholder="Comercio o fuente" />
                        <input name="amount" type="number" step="0.01" defaultValue={item.amount} className="input" required />
                        <select name="type" defaultValue={item.type} className="input">
                          <option value="expense">Gasto</option>
                          <option value="income">Ingreso</option>
                        </select>
                        <input name="category" list="transaction-categories" defaultValue={item.category} className="input" required />
                        <input name="date" type="date" defaultValue={dateInputValue(item.date)} className="input" required />
                        <input name="notes" defaultValue={item.notes || ""} className="input xl:col-span-2" placeholder="Notas" />
                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                          <input name="recurring" type="checkbox" defaultChecked={item.recurring} />
                          Recurrente
                        </label>
                        <div className="flex items-center justify-end gap-3 xl:col-span-4">
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
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">No hay movimientos con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
