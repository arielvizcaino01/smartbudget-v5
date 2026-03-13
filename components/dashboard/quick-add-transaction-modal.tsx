"use client";

import { useMemo, useState } from "react";
import { Landmark, Wallet, X, Plus } from "lucide-react";

type CategoryItem = { id: string; name: string; icon?: string | null };
type AccountItem = { id: string; name: string; type: string; currentBalance: number };

type Props = {
  categories: CategoryItem[];
  accounts: AccountItem[];
  action: (formData: FormData) => void | Promise<void>;
};

const categoryStyles: Record<string, string> = {
  Comida: 'bg-orange-50 text-orange-700 border-orange-100',
  Transporte: 'bg-sky-50 text-sky-700 border-sky-100',
  Hogar: 'bg-violet-50 text-violet-700 border-violet-100',
  Entretenimiento: 'bg-pink-50 text-pink-700 border-pink-100',
  Ingresos: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  General: 'bg-slate-100 text-slate-700 border-slate-200'
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(value);
}

export default function QuickAddTransactionModal({ categories, accounts, action }: Props) {
  const [open, setOpen] = useState(false);
  const defaultCategory = useMemo(() => categories[0]?.name ?? 'General', [categories]);
  const defaultAccount = useMemo(() => accounts[0]?.id ?? '', [accounts]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fab-primary lg:hidden"
        aria-label="Agregar movimiento"
      >
        <Plus className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 lg:inline-flex lg:items-center lg:gap-2"
      >
        <Plus className="h-4 w-4" /> Nuevo movimiento
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/50 p-0 sm:items-center sm:justify-center sm:p-6">
          <div className="slide-up-panel max-h-[92vh] w-full overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-w-2xl sm:rounded-[2rem]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600">Alta rápida</p>
                <h3 className="text-lg font-semibold text-slate-900">Nuevo movimiento</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={action} className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">1. Categoría</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {categories.slice(0, 6).map((item, index) => (
                    <label key={item.id} className={`flex cursor-pointer items-center justify-between rounded-3xl border px-4 py-4 text-sm font-medium transition hover:-translate-y-0.5 ${categoryStyles[item.name] || categoryStyles.General}`}>
                      <span>{item.name}</span>
                      <input type="radio" name="category" value={item.name} defaultChecked={index === 0} className="h-4 w-4" />
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5">
                    <span>Auto</span>
                    <input type="radio" name="category" value="Auto" className="h-4 w-4" defaultChecked={!defaultCategory} />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_.8fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
                  <p className="mb-3 text-sm font-medium text-slate-700">2. Monto y tipo</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                        <input type="radio" name="type" value="expense" className="mr-2 h-4 w-4" defaultChecked />Gasto
                      </label>
                      <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                        <input type="radio" name="type" value="income" className="mr-2 h-4 w-4" />Ingreso
                      </label>
                    </div>
                    <input name="amount" type="number" step="0.01" placeholder="0.00" required className="input text-center text-3xl font-semibold tracking-tight" />
                    <input name="name" className="input" placeholder="Nombre del movimiento" required />
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-700">3. Cuenta</p>
                  <div className="space-y-3">
                    {accounts.map((item, index) => (
                      <label key={item.id} className="flex cursor-pointer items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                            {item.type === 'cash' ? <Wallet className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">{formatCurrency(item.currentBalance)}</p>
                          </div>
                        </div>
                        <input type="radio" name="accountId" value={item.id} defaultChecked={index === 0 || item.id === defaultAccount} className="h-4 w-4" required />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <details className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-medium text-slate-700">Detalles opcionales</summary>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input name="merchant" className="input" placeholder="Comercio o fuente" />
                  <input name="date" type="date" className="input" />
                  <input name="notes" className="input sm:col-span-2" placeholder="Notas" />
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:col-span-2">
                    <input name="recurring" type="checkbox" /> Recurrente
                  </label>
                </div>
              </details>

              <div className="flex items-center gap-3 pb-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50">Cancelar</button>
                <button className="btn-primary flex-1">Guardar movimiento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
