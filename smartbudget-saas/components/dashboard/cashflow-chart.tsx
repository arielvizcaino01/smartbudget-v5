"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

export function CashflowChart({
  data,
  title,
  description
}: {
  data: Array<{ label: string; income: number; expense: number }>;
  title?: string;
  description?: string;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title || 'Ingreso vs gasto'}</h2>
        <p className="text-sm text-slate-500">{description || 'Comparación del flujo de caja en el periodo seleccionado.'}</p>
      </div>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Area type="monotone" dataKey="income" fillOpacity={0.18} strokeWidth={2} />
            <Area type="monotone" dataKey="expense" fillOpacity={0.12} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
