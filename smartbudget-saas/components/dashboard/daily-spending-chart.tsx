'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export function DailySpendingChart({
  data,
  title,
  description
}: {
  data: Array<{ label: string; amount: number }>;
  title?: string;
  description?: string;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title || 'Ritmo de gasto'}</h2>
        <p className="text-sm text-slate-500">{description || 'Distribución del gasto dentro del periodo seleccionado.'}</p>
      </div>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Area type="monotone" dataKey="amount" strokeWidth={2} fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
