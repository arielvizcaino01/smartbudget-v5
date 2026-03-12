"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

export function SpendingChart({ data }: { data: Array<{ category: string; spent: number; limit: number }> }) {
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Gasto por categoría</h2>
        <p className="text-sm text-slate-500">Comparación rápida entre lo gastado y el tope mensual.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="category" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="limit" radius={[10, 10, 0, 0]} />
            <Bar dataKey="spent" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
