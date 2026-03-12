'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, ComposedChart } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export function FutureTimeline({ data }: { data: Array<{ month: string; fixed: number; projectedCash: number }> }) {
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Timeline de gastos futuros</h2>
        <p className="text-sm text-slate-500">Proyección de pagos fijos y flujo libre para los próximos meses.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="fixed" radius={[10, 10, 0, 0]} />
            <Line type="monotone" dataKey="projectedCash" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
