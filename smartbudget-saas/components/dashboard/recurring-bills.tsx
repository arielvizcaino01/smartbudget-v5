import { formatCurrency } from "@/lib/utils";

export function RecurringBills({ items }: { items: Array<{ id: string; name: string; amount: number; dueDate: Date; frequency: string }> }) {
  return (
    <div className="card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Próximos pagos</h2>
        <p className="text-sm text-slate-500">Recordatorios de tus gastos recurrentes más cercanos.</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-slate-500">{item.frequency} · vence {new Date(item.dueDate).toLocaleDateString("es-ES")}</p>
            </div>
            <p className="font-semibold">{formatCurrency(item.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
