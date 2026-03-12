"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export function ForecastChart({
  data
}: {
  data: Array<{ label: string; projectedIncome: number; projectedExpense: number; projectedNet: number }>;
}) {
  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Proyección del periodo</h2>
        <p className="text-sm text-slate-500">Estimación simple del cierre con base en el ritmo actual de ingresos y gastos.</p>
      </div>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Area type="monotone" dataKey="projectedIncome" fillOpacity={0.16} strokeWidth={2} />
            <Area type="monotone" dataKey="projectedExpense" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {data.slice(-3).map((item) => (
          <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">Ingresos {formatCurrency(item.projectedIncome)}</p>
            <p className="mt-1 text-sm font-medium text-slate-700">Gastos {formatCurrency(item.projectedExpense)}</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">Neto {formatCurrency(item.projectedNet)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
