import { ArrowRightLeft, Landmark, PiggyBank, Wallet } from "lucide-react";
import { requireCompletedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { createAccount, createTransfer, deleteAccount, reconcileAccount, updateAccount } from "@/app/dashboard/actions";

function dateInputValue(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

const typeLabels: Record<string, string> = {
  bank: "Cuenta bancaria",
  cash: "Efectivo",
  savings: "Ahorros",
  debit: "Tarjeta de débito",
  digital: "Wallet digital"
};

const typeAccent: Record<string, string> = {
  bank: 'bg-sky-50 text-sky-700',
  cash: 'bg-amber-50 text-amber-700',
  savings: 'bg-emerald-50 text-emerald-700',
  debit: 'bg-violet-50 text-violet-700',
  digital: 'bg-brand-50 text-brand-700'
};

export default async function AccountsPage() {
  const user = await requireCompletedUser();
  const [accounts, transfers, reconciliations] = await Promise.all([
    prisma.account.findMany({ where: { userId: user.id }, orderBy: [{ isActive: "desc" }, { createdAt: "asc" }] }),
    prisma.transfer.findMany({
      where: { userId: user.id },
      include: { fromAccount: true, toAccount: true },
      orderBy: { date: "desc" },
      take: 10
    }),
    prisma.accountReconciliation.findMany({
      where: { userId: user.id },
      include: { account: true },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  const total = accounts.reduce((sum, item) => sum + item.currentBalance, 0);
  const cash = accounts.filter((item) => item.type === "cash").reduce((sum, item) => sum + item.currentBalance, 0);
  const bank = accounts.filter((item) => item.type !== "cash").reduce((sum, item) => sum + item.currentBalance, 0);

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Cuentas y efectivo</h2>
            <p className="text-sm text-slate-500">Organiza dónde está tu dinero, concilia saldos reales y mueve fondos entre cuentas sin perder el control.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-950 p-4 text-white"><p className="text-xs uppercase tracking-wide text-slate-300">Patrimonio líquido</p><p className="mt-2 text-2xl font-semibold">{formatCurrency(total)}</p></div>
            <div className="rounded-3xl bg-sky-50 p-4"><p className="text-xs uppercase tracking-wide text-sky-700">Bancos y wallets</p><p className="mt-2 text-2xl font-semibold text-sky-800">{formatCurrency(bank)}</p></div>
            <div className="rounded-3xl bg-amber-50 p-4"><p className="text-xs uppercase tracking-wide text-amber-700">Efectivo</p><p className="mt-2 text-2xl font-semibold text-amber-800">{formatCurrency(cash)}</p></div>
          </div>
        </div>
        <form action={createAccount} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input name="name" className="input" placeholder="Nombre de la cuenta" required />
          <select name="type" className="input" defaultValue="bank">
            <option value="bank">Cuenta bancaria</option>
            <option value="cash">Efectivo</option>
            <option value="savings">Ahorros</option>
            <option value="debit">Tarjeta de débito</option>
            <option value="digital">Wallet digital</option>
          </select>
          <input name="initialBalance" type="number" step="0.01" className="input" placeholder="Saldo inicial" required />
          <input name="currency" defaultValue={user.currency} className="input" placeholder="Moneda" />
          <button className="btn-primary xl:justify-self-end">Agregar cuenta</button>
        </form>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-5">
          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Tus cuentas</h3>
                <p className="text-sm text-slate-500">Tarjetas limpias para revisar rápido saldos, tipo de cuenta y estado.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{accounts.length} activas</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {accounts.map((item) => (
                <div key={item.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${typeAccent[item.type] || 'bg-slate-100 text-slate-700'}`}>{typeLabels[item.type] || item.type}</div>
                      <p className="mt-3 text-lg font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">Saldo inicial {formatCurrency(item.initialBalance)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">{item.type === 'cash' ? <Wallet className="h-5 w-5" /> : item.type === 'savings' ? <PiggyBank className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}</div>
                  </div>
                  <p className="text-sm text-slate-500">Saldo actual</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-900">{formatCurrency(item.currentBalance)}</p>
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <form action={updateAccount} className="grid gap-3">
                      <input type="hidden" name="id" value={item.id} />
                      <input name="name" defaultValue={item.name} className="input" required />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <select name="type" defaultValue={item.type} className="input">
                          <option value="bank">Cuenta bancaria</option>
                          <option value="cash">Efectivo</option>
                          <option value="savings">Ahorros</option>
                          <option value="debit">Tarjeta de débito</option>
                          <option value="digital">Wallet digital</option>
                        </select>
                        <input name="initialBalance" type="number" step="0.01" defaultValue={item.initialBalance} className="input" required />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input name="currency" defaultValue={item.currency} className="input" />
                        <select name="isActive" defaultValue={item.isActive ? "on" : "off"} className="input">
                          <option value="on">Activa</option>
                          <option value="off">Oculta</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <button formAction={deleteAccount} name="id" value={item.id} className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-50">Eliminar</button>
                        <button className="btn-primary">Guardar</button>
                      </div>
                    </form>
                  </div>
                </div>
              ))}
            </div>
            {accounts.length === 0 && <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">Aún no tienes cuentas. Crea una bancaria o de efectivo para que el balance empiece a tener sentido.</div>}
          </section>

          <section className="card p-5">
            <h3 className="text-lg font-semibold">Últimas conciliaciones</h3>
            <div className="mt-4 space-y-3">
              {reconciliations.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.account.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString("es-ES")} · saldo real {formatCurrency(item.actualBalance)}</p>
                  <p className={`mt-2 text-sm font-semibold ${item.adjustment >= 0 ? "text-emerald-600" : "text-rose-600"}`}>Ajuste {item.adjustment >= 0 ? "+" : ""}{formatCurrency(item.adjustment)}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.note || "Sin nota"}</p>
                </div>
              ))}
              {reconciliations.length === 0 && <p className="text-sm text-slate-500">Todavía no has conciliado ninguna cuenta.</p>}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section id="transfer" className="card p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-2xl bg-brand-50 p-3 text-brand-700"><ArrowRightLeft className="h-5 w-5" /></span>
              <div>
                <h3 className="text-lg font-semibold">Transferir entre cuentas</h3>
                <p className="text-sm text-slate-500">Mueve dinero entre banco, efectivo o ahorro sin alterar el balance total.</p>
              </div>
            </div>
            <form action={createTransfer} className="mt-4 grid gap-3">
              <select name="fromAccountId" className="input" required>
                <option value="">Sale de...</option>
                {accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <select name="toAccountId" className="input" required>
                <option value="">Entra a...</option>
                {accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <input name="amount" type="number" step="0.01" className="input" placeholder="Monto" required />
              <input name="date" type="date" defaultValue={dateInputValue(new Date())} className="input" required />
              <input name="note" className="input" placeholder="Nota opcional" />
              <button className="btn-primary">Registrar transferencia</button>
            </form>
          </section>

          <section className="card p-5">
            <h3 className="text-lg font-semibold">Conciliar una cuenta</h3>
            <p className="mt-1 text-sm text-slate-500">Ajusta el saldo real cuando la app no coincide con el banco o el efectivo que tienes.</p>
            <div className="mt-4 space-y-3">
              {accounts.map((item) => (
                <form key={item.id} action={reconcileAccount} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <input type="hidden" name="accountId" value={item.id} />
                  <div className="mb-3">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">Saldo en la app: {formatCurrency(item.currentBalance)}</p>
                  </div>
                  <div className="grid gap-3">
                    <input name="actualBalance" type="number" step="0.01" defaultValue={item.currentBalance} className="input" placeholder="Saldo real" required />
                    <input name="note" className="input" placeholder="Nota opcional" />
                    <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">Conciliar</button>
                  </div>
                </form>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h3 className="text-lg font-semibold">Transferencias recientes</h3>
            <div className="mt-4 space-y-3">
              {transfers.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.fromAccount.name} → {item.toAccount.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{new Date(item.date).toLocaleDateString("es-ES")} · {item.note || "Sin nota"}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(item.amount)}</p>
                </div>
              ))}
              {transfers.length === 0 && <p className="text-sm text-slate-500">Todavía no hay transferencias registradas.</p>}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
